module.exports = {
    mongoConnection: process.env.MONGO || "mongodb://127.0.0.1:27017",
    secret: process.env.SECRET || "TETRIANDOCH",
    dbName: process.env.DBNAME || "sog-db",
    tokenExpirationTime: 48 * 60 * 60
};
