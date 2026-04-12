"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var mongodb_1 = require("mongodb");
var dotenv_1 = require("dotenv");
var dns_1 = require("dns");
// Force Google DNS to bypass local ISP blocks on SRV queries
dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
dotenv_1.default.config();
var PG_URL = process.env.DATABASE_URL || 'postgresql://charronix_user:charronix_pass_2024@localhost:5432/charronix_db';
var MONGO_URL = 'mongodb+srv://charlesjehanabad12345_db_user:QnxvTS546eTPe22a@cluster0.tui3r3t.mongodb.net/?appName=Cluster0';
var MONGO_DB_NAME = 'charronix_db';
function migrate() {
    return __awaiter(this, void 0, void 0, function () {
        var pgClient, mongoClient, db, tableRes, tables, _i, tables_1, table, dataRes, rows, sanitizedRows, collection, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 Starting Database Migration...');
                    pgClient = new pg_1.Client({ connectionString: PG_URL });
                    mongoClient = new mongodb_1.MongoClient(MONGO_URL, { family: 4 });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, 12, 15]);
                    return [4 /*yield*/, pgClient.connect()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, mongoClient.connect()];
                case 3:
                    _a.sent();
                    console.log('✅ Connected to PostgreSQL and MongoDB');
                    db = mongoClient.db(MONGO_DB_NAME);
                    return [4 /*yield*/, pgClient.query("\n            SELECT table_name \n            FROM information_schema.tables \n            WHERE table_schema = 'public' \n            AND table_type = 'BASE TABLE'\n        ")];
                case 4:
                    tableRes = _a.sent();
                    tables = tableRes.rows.map(function (r) { return r.table_name; });
                    console.log("\uD83D\uDCC2 Found ".concat(tables.length, " tables to migrate: ").concat(tables.join(', ')));
                    _i = 0, tables_1 = tables;
                    _a.label = 5;
                case 5:
                    if (!(_i < tables_1.length)) return [3 /*break*/, 10];
                    table = tables_1[_i];
                    console.log("\n\u23F3 Migrating table: ".concat(table, "..."));
                    return [4 /*yield*/, pgClient.query("SELECT * FROM \"".concat(table, "\""))];
                case 6:
                    dataRes = _a.sent();
                    rows = dataRes.rows;
                    if (rows.length === 0) {
                        console.log("\u23E9 Table ".concat(table, " is empty, skipping."));
                        return [3 /*break*/, 9];
                    }
                    sanitizedRows = rows.map(function (row) {
                        var newRow = __assign({}, row);
                        for (var key in newRow) {
                            var val = newRow[key];
                            // Handle Decimal types
                            if (val && typeof val === 'object' && val.constructor.name === 'Decimal') {
                                newRow[key] = parseFloat(val.toString());
                            }
                            // Handle nulls if necessary (MongoDB stores nulls fine)
                        }
                        return newRow;
                    });
                    collection = db.collection(table);
                    // Optional: Clear existing data in collection
                    return [4 /*yield*/, collection.deleteMany({})];
                case 7:
                    // Optional: Clear existing data in collection
                    _a.sent();
                    return [4 /*yield*/, collection.insertMany(sanitizedRows)];
                case 8:
                    result = _a.sent();
                    console.log("\u2705 Table ".concat(table, " migrated successfullly. Documents inserted: ").concat(result.insertedCount));
                    _a.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 5];
                case 10:
                    console.log('\n✨ Migration Complete!');
                    console.log("\uD83D\uDD17 You can now connect to MongoDB Compass using: ".concat(MONGO_URL).concat(MONGO_DB_NAME));
                    return [3 /*break*/, 15];
                case 11:
                    err_1 = _a.sent();
                    console.error('❌ Migration Failed:', err_1);
                    return [3 /*break*/, 15];
                case 12: return [4 /*yield*/, pgClient.end()];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, mongoClient.close()];
                case 14:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
migrate();
