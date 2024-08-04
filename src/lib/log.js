const LogFormatter = (level, message, service_name) => {
    const dateNow = new Date().toISOString();
    return `${dateNow} [${level}] ${service_name} - ${message}`;
};
export { LogFormatter };
