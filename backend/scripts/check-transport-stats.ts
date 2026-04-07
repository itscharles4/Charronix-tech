import { TransportService } from '../src/services/transport.service';

const transportService = new TransportService();

async function main() {
    try {
        const stats = await transportService.getDashboardStats();
        console.log('--- DASHBOARD STATS ---');
        console.log(JSON.stringify(stats, null, 2));
        console.log('-----------------------');
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
    }
}

main();
