module.exports = value => {
    const str = String(value)
    return str.length < 3 ? str.padStart(3, '0') : str
}
