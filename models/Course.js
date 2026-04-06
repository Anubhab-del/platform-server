import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  duration: { type: String, default: '10 min' },
  videoUrl: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [120, 'Title too long'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    shortDescription: {
      type: String,
      maxlength: 200,
      default: '',
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
    },
    instructorBio: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Web Development',
        'Data Science',
        'AI & Machine Learning',
        'Mobile Development',
        'DevOps & Cloud',
        'Cybersecurity',
        'UI/UX Design',
        'Business & Finance',
        'Digital Marketing',
        'Database',
      ],
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    duration: { type: String, default: '10 hours' },
    price: { type: Number, default: 0, min: 0 },
    isFree: { type: Boolean, default: false },
    thumbnail: { type: String, default: '' },
    previewVideoUrl: { type: String, default: '' },
    lessons: [lessonSchema],
    tags: [{ type: String, trim: true }],
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    enrolledCount: { type: Number, default: 0 },
    language: { type: String, default: 'English' },
    isPublished: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug before saving
courseSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Index for fast search by title
courseSchema.index({ title: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;