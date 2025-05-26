// Bu patch, Mongoose'un find sorgularında allowDiskUse(true) kullanılmasını sağlar.
// Mongoose 7+ ile birlikte Query.prototype.allowDiskUse metodu desteklenir.
// Ancak Next.js API route'larında bazen .allowDiskUse(true) doğrudan çalışmaz.
// Bu nedenle, patch ile Query prototipine ekliyoruz.

const mongoose = require('mongoose');

if (mongoose && mongoose.Query && !mongoose.Query.prototype.allowDiskUse) {
  mongoose.Query.prototype.allowDiskUse = function (value = true) {
    this.options.allowDiskUse = value;
    return this;
  };
}

// Next.js API route'unda bu dosya ilk import edilen yerde require edilmelidir.
