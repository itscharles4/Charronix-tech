import { FeeType, PaymentMethod } from '@prisma/client';
import prisma from '../config/database';
import { RazorpayService } from './razorpay.service';
import { NotificationService } from './notification.service';

export class FeeService {
    /**
     * Get student's complete fee details with summary
     */
    static async getStudentFeeDetails(studentId: string) {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                feeRecords: {
                    include: {
                        feeStructure: true,
                        payments: { orderBy: { createdAt: 'desc' } },
                    },
                    orderBy: { dueDate: 'asc' },
                },
            },
        });

        if (!student) throw new Error('Student not found');

        // Auto-mark overdue records
        const now = new Date();
        for (const fr of student.feeRecords) {
            if (!fr.isPaid && new Date(fr.dueDate) < now && !fr.isOverdue) {
                await prisma.feeRecord.update({
                    where: { id: fr.id },
                    data: {
                        isOverdue: true,
                        lateFeeApplied: fr.feeStructure.lateFee,
                    },
                });
                fr.isOverdue = true;
                fr.lateFeeApplied = fr.feeStructure.lateFee;
            }
        }

        const totalDue = student.feeRecords
            .filter((fr) => !fr.isPaid)
            .reduce((sum, fr) => sum + fr.remainingAmount + fr.lateFeeApplied, 0);

        const totalPaid = student.feeRecords.reduce((sum, fr) => sum + fr.paidAmount, 0);

        const overdueAmount = student.feeRecords
            .filter((fr) => !fr.isPaid && fr.isOverdue)
            .reduce((sum, fr) => sum + fr.remainingAmount + fr.lateFeeApplied, 0);

        return {
            success: true,
            data: {
                student: {
                    id: student.id,
                    name: `${student.firstName} ${student.lastName}`,
                    admissionNo: student.admissionNo,
                    class: student.class,
                    section: student.section,
                },
                summary: { totalDue, totalPaid, overdueAmount },
                feeRecords: student.feeRecords.map((fr) => ({
                    id: fr.id,
                    feeType: fr.feeType,
                    academicYear: fr.academicYear,
                    totalAmount: fr.totalAmount,
                    paidAmount: fr.paidAmount,
                    remainingAmount: fr.remainingAmount,
                    dueDate: fr.dueDate,
                    status: fr.status,
                    isPaid: fr.isPaid,
                    isOverdue: fr.isOverdue,
                    lateFeeApplied: fr.lateFeeApplied,
                    payments: fr.payments,
                    description: fr.feeStructure.description,
                })),
            },
        };
    }

    /**
     * Initiate payment — creates gateway order + pending payment records
     */
    static async initiatePayment(data: {
        studentId: string;
        parentUserId: string;
        feeRecordIds: string[];
        paymentMethod: PaymentMethod;
    }) {
        const { studentId, parentUserId, feeRecordIds, paymentMethod } = data;

        const feeRecords = await prisma.feeRecord.findMany({
            where: { id: { in: feeRecordIds }, studentId },
            include: { student: true },
        });

        if (feeRecords.length === 0) throw new Error('No valid fee records found');

        const totalAmount = feeRecords.reduce(
            (sum, fr) => sum + fr.remainingAmount + fr.lateFeeApplied,
            0,
        );
        if (totalAmount <= 0) throw new Error('Invalid payment amount');

        const receiptNumber = `RCP${Date.now()}${Math.floor(Math.random() * 1000)}`;

        let gatewayOrder: any = null;
        if (paymentMethod === 'RAZORPAY') {
            const result = await RazorpayService.createOrder(totalAmount, receiptNumber, {
                studentId,
                studentName: `${feeRecords[0].student.firstName} ${feeRecords[0].student.lastName}`,
                feeTypes: feeRecords.map((fr) => fr.feeType).join(', '),
            });
            gatewayOrder = result.data;
        }

        // Create one payment record per fee record (same order & receipt)
        await Promise.all(
            feeRecords.map((fr) =>
                prisma.payment.create({
                    data: {
                        feeRecordId: fr.id,
                        studentId,
                        parentUserId,
                        amount: fr.remainingAmount + fr.lateFeeApplied,
                        paymentMethod,
                        transactionId: `TXN${Date.now()}${Math.random().toString(36).substring(2)}`,
                        receiptNumber,
                        gatewayOrderId: gatewayOrder?.id,
                        status: 'PENDING',
                    },
                }),
            ),
        );

        return {
            success: true,
            message: 'Payment initiated successfully',
            data: {
                orderId: gatewayOrder?.id,
                amount: totalAmount,
                currency: 'INR',
                receiptNumber,
                keyId: process.env.RAZORPAY_KEY_ID,
            },
        };
    }

    /**
     * Verify Razorpay payment and update records
     */
    static async verifyPayment(data: {
        orderId: string;
        paymentId: string;
        signature: string;
    }) {
        const { orderId, paymentId, signature } = data;

        const isValid = RazorpayService.verifyPaymentSignature(orderId, paymentId, signature);
        if (!isValid) throw new Error('Invalid payment signature');

        const paymentDetails = await RazorpayService.getPaymentDetails(paymentId);

        const payments = await prisma.payment.findMany({
            where: { gatewayOrderId: orderId },
            include: {
                feeRecord: {
                    include: { student: true }
                }
            },
        });

        if (payments.length === 0) throw new Error('Payment record not found');

        // Update payment records
        await Promise.all(
            payments.map((p) =>
                prisma.payment.update({
                    where: { id: p.id },
                    data: {
                        status: 'COMPLETED',
                        gatewayPaymentId: paymentId,
                        gatewaySignature: signature,
                        gatewayResponse: paymentDetails.data as any,
                        paidAt: new Date(),
                    },
                }),
            ),
        );

        // Update fee records
        await Promise.all(
            payments.map((p) => {
                const newPaid = p.feeRecord.paidAmount + p.amount;
                const newRemaining = Math.max(0, p.feeRecord.remainingAmount - p.amount);
                return prisma.feeRecord.update({
                    where: { id: p.feeRecordId },
                    data: {
                        paidAmount: newPaid,
                        remainingAmount: newRemaining,
                        status: newRemaining <= 0 ? 'COMPLETED' : 'PROCESSING',
                        isPaid: newRemaining <= 0,
                    },
                });
            }),
        );

        // Send SMS Notification
        try {
            const firstPayment = payments[0];
            const student = firstPayment.feeRecord.student;
            const totalAmountPaid = payments.reduce((sum, p) => sum + p.amount, 0);

            if (student.parentPhone) {
                const message = `Dear Parent, fee payment of INR ${totalAmountPaid} for ${student.firstName} is successful. Receipt No: ${firstPayment.receiptNumber}. Thank you, Charronix School.`;
                await NotificationService.sendSMS(student.parentPhone, message);
            }
        } catch (smsError) {
            console.error('Failed to send success SMS:', smsError);
        }

        return {
            success: true,
            message: 'Payment verified and completed successfully',
            data: {
                receiptNumber: payments[0].receiptNumber,
                amount: payments.reduce((sum, p) => sum + p.amount, 0),
                paymentId,
            },
        };
    }

    /**
     * Get payment history for a student
     */
    static async getPaymentHistory(studentId: string) {
        const payments = await prisma.payment.findMany({
            where: { studentId },
            include: {
                feeRecord: { include: { feeStructure: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return {
            success: true,
            data: payments.map((p) => ({
                id: p.id,
                receiptNumber: p.receiptNumber,
                amount: p.amount,
                feeType: p.feeRecord.feeType,
                paymentMethod: p.paymentMethod,
                status: p.status,
                transactionId: p.transactionId,
                paidAt: p.paidAt,
                receiptUrl: p.receiptUrl,
            })),
        };
    }

    /**
     * Admin: Create fee structure and auto-assign to students in that class
     */
    static async createFeeStructure(data: {
        schoolId: string;
        feeType: FeeType;
        class: string;
        academicYear: string;
        amount: number;
        dueDate: Date;
        lateFee?: number;
        discount?: number;
        description?: string;
    }) {
        const feeStructure = await prisma.feeStructure.create({
            data: {
                schoolId: data.schoolId,
                feeType: data.feeType,
                class: data.class,
                academicYear: data.academicYear,
                amount: data.amount,
                dueDate: data.dueDate,
                lateFee: data.lateFee || 0,
                discount: data.discount || 0,
                description: data.description,
            },
        });

        const students = await prisma.student.findMany({
            where: { class: data.class, status: 'ACTIVE' },
        });

        const netAmount = data.amount - (data.discount || 0);

        if (students.length > 0) {
            await Promise.all(
                students.map((student) =>
                    prisma.feeRecord.create({
                        data: {
                            studentId: student.id,
                            feeStructureId: feeStructure.id,
                            feeType: data.feeType,
                            academicYear: data.academicYear,
                            totalAmount: netAmount,
                            remainingAmount: netAmount,
                            dueDate: data.dueDate,
                        },
                    }),
                ),
            );
        }

        return {
            success: true,
            message: `Fee structure created and assigned to ${students.length} students`,
            data: feeStructure,
        };
    }

    /**
     * Admin: List all fee structures
     */
    static async listFeeStructures(schoolId: string) {
        const structures = await prisma.feeStructure.findMany({
            where: { schoolId, isActive: true },
            include: {
                _count: { select: { feeRecords: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return { success: true, data: structures };
    }

    /**
     * Admin: Get fee collection summary
     */
    static async getFeeCollectionSummary(schoolId: string, academicYear: string) {
        const structures = await prisma.feeStructure.findMany({
            where: { schoolId, academicYear },
            include: {
                feeRecords: {
                    select: { totalAmount: true, paidAmount: true, isPaid: true, isOverdue: true },
                },
            },
        });

        const summary = structures.map((s) => ({
            feeType: s.feeType,
            class: s.class,
            totalStudents: s.feeRecords.length,
            paidStudents: s.feeRecords.filter((fr) => fr.isPaid).length,
            overdueStudents: s.feeRecords.filter((fr) => fr.isOverdue && !fr.isPaid).length,
            totalExpected: s.feeRecords.reduce((sum, fr) => sum + fr.totalAmount, 0),
            totalCollected: s.feeRecords.reduce((sum, fr) => sum + fr.paidAmount, 0),
        }));

        return { success: true, data: summary };
    }
}
