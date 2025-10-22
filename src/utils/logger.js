// import di winston per gestione log professionale
import winston from "winston";

// definisce il formato dei log (timestamp + livello + messaggio)
const { combine, timestamp, printf, colorize } = winston.format;

// formato custom per i messaggi di log
const myFormat = printf(({ level, message, timestamp: ts }) => {
  return `${ts} [${level}] ${message}`;
});

// crea il logger principale con un transport console
export const logger = winston.createLogger({
  level: "info", // livello di default
  format: combine(
    timestamp(), // aggiunge timestamp
    myFormat // applica il formato custom
  ),
  transports: [
    new winston.transports.Console(), // log su console (si possono aggiungere file in produzione)
  ],
});

// stream compatibile con morgan: morgan scrive su stream.write()
// qui si fornisce un'interfaccia  che manda il messaggio a winston.info
export const stream = {
  write: (message) => {
    // morgan aggiunge una newline; la si rimuove per avere log puliti
    logger.info(message.trim());
  },
};
