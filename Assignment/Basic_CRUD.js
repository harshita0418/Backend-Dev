
const Student = require('./models/Student');

//Add new student
const addStudent = async (data) => {
  try {
    const student = await Student.create(data);
    console.log('Student added:', student);
    return { success: true, data: student };
  } catch (error) {
    if (error.name === 'ValidationError') {
      return { success: false, errors: Object.values(error.errors).map(e => e.message) };
    }
    if (error.code === 11000) {
      return { success: false, error: 'Email already exists' };
    }
    throw error;
  }
};

//View all students
const getAllStudents = async () => {
  try {
    const students = await Student.find()
      .select('name email age gpa courses')
      .sort({ name: 1 });
    console.log(`Total students: ${students.length}`);
    return students;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

//Find student by email
const findByEmail = async (email) => {
  try {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return { success: false, error: 'Student not found' };
    }
    return { success: true, data: student };
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

//Update student GPA
const updateGPA = async (email, newGPA) => {
  try {
    const student = await Student.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { gpa: newGPA } },
      { new: true, runValidators: true }
    );
    if (!student) {
      return { success: false, error: 'Student not found' };
    }
    console.log(`GPA updated to ${student.gpa} for ${student.name}`);
    return { success: true, data: student };
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

//Delete student
const deleteStudent = async (email) => {
  try {
    const student = await Student.findOneAndDelete({ email: email.toLowerCase() });
    if (!student) {
      return { success: false, error: 'Student not found' };
    }
    console.log('Deleted student:', student.name);
    return { success: true, data: student };
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};