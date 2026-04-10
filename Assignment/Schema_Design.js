
//Course with prerequisites
const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  credits: {
    type: Number,
    required: true,
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot exceed 6']
  },
  department: { type: String, required: true },
  description: String,
  // Self-referencing for prerequisites
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  maxEnrollment: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Instance method to check if a student can enroll
courseSchema.methods.canEnroll = async function(studentCourses) {
  if (this.prerequisites.length === 0) return true;
  const prereqs = this.prerequisites.map(p => p.toString());
  return prereqs.every(p => studentCourses.includes(p));
};

const Course = mongoose.model('Course', courseSchema);

//Professor with multiple departments
const professorSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  // Multiple departments via array
  departments: {
    type: [String],
    required: true,
    validate: {
      validator: arr => arr.length >= 1,
      message: 'Professor must belong to at least one department'
    }
  },
  primaryDepartment: { type: String, required: true },
  designation: {
    type: String,
    enum: ['assistant', 'associate', 'full', 'adjunct', 'visiting'],
    required: true
  },
  coursesTaught: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  officeHours: {
    day: String,
    startTime: String,
    endTime: String
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

professorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const Professor = mongoose.model('Professor', professorSchema);

//Grade with student and course references
const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor'
  },
  semester: {
    type: String,
    required: true,
    enum: ['Spring', 'Summer', 'Fall', 'Winter']
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100
  },
  marks: {
    assignment: { type: Number, min: 0, max: 100 },
    midterm:    { type: Number, min: 0, max: 100 },
    final:      { type: Number, min: 0, max: 100 }
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'],
    required: true
  },
  gradePoints: { type: Number, min: 0.0, max: 4.0 }
}, { timestamps: true });

// Compound index — one grade per student per course per semester
gradeSchema.index({ student: 1, course: 1, semester: 1, year: 1 }, { unique: true });

// Auto-calculate grade points before saving
gradeSchema.pre('save', function(next) {
  const map = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0,
                'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
  this.gradePoints = map[this.grade] ?? 0;
  next();
});

const Grade = mongoose.model('Grade', gradeSchema);