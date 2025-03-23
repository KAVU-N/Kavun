import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ad Soyad alanı zorunludur'],
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Ünvan alanı zorunludur'],
    trim: true,
  },
  expertise: {
    type: [String],
    required: [true, 'En az bir uzmanlık alanı seçilmelidir'],
    validate: {
      validator: function(v: string[]) {
        return v.length > 0;
      },
      message: 'En az bir uzmanlık alanı seçilmelidir'
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Puan 0\'dan küçük olamaz'],
    max: [5, 'Puan 5\'ten büyük olamaz']
  },
  students: {
    type: Number,
    default: 0,
    min: [0, 'Öğrenci sayısı 0\'dan küçük olamaz']
  },
  courses: {
    type: Number,
    default: 0,
    min: [0, 'Kurs sayısı 0\'dan küçük olamaz']
  },
  image: {
    type: String,
    default: '/instructors/default.jpg'
  },
  university: {
    type: String,
    required: [true, 'Üniversite alanı zorunludur'],
    trim: true
  }
}, {
  timestamps: true,
  strict: true
});

// Eğer model zaten tanımlıysa onu kullan, değilse yeni model oluştur
const Instructor = mongoose.models.Instructor || mongoose.model('Instructor', instructorSchema);

export default Instructor;
