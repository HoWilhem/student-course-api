const storage = require('../../src/services/storage');
const coursesController = require('../../src/controllers/coursesController');

beforeEach(() => {
  storage.reset();
  storage.seed();
});

test('should allow duplicate course title', () => {
  const result = storage.create('courses', {
    title: 'Math',
    teacher: 'Someone',
  });
  expect(result.error).toBe('Course title must be unique'); 
});

test('should list seeded students', () => {
  const students = storage.list('students');
  expect(students.length).toBe(3);
  expect(students[0].name).toBe('Alice');
});

test('should create a new student', () => {
  const result = storage.create('students', {
    name: 'David',
    email: 'david@example.com',
  });
  expect(result.name).toBe('David');
  expect(storage.list('students').length).toBe(4);
});

test('should not allow duplicate student email', () => {
  const result = storage.create('students', {
    name: 'Eve',
    email: 'alice@example.com',
  });
  expect(result.error).toBe('Email must be unique');
});

test('should delete a student', () => {
  const students = storage.list('students');
  const result = storage.remove('students', students[0].id);
  expect(result).toBe(true);
});

test('should allow more than 3 students in a course', () => {
  const students = storage.list('students');
  const course = storage.list('courses')[0];
  storage.create('students', { name: 'Extra', email: 'extra@example.com' });
  storage.create('students', { name: 'Extra2', email: 'extra2@example.com' });
  storage.enroll(students[0].id, course.id);
  storage.enroll(students[1].id, course.id);
  storage.enroll(students[2].id, course.id);
  const result = storage.enroll(4, course.id);
  expect(result.error).toBe('Course is full');
});

test('createCourse - should return 400 if missing fields', () => {
  const req = { body: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  coursesController.createCourse(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    error: 'title and teacher required',
  });
});

test('createCourse - should return 201 and create course', () => {
  const req = { body: { title: 'SVT', teacher: 'Mr. John' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  coursesController.createCourse(req, res);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'SVT',
      teacher: 'Mr. John',
    }),
  );
});

test('should not delete student if enrolled in a course', () => {
  // Récupère un étudiant et un cours du seed
  const student = storage.list('students')[0];
  const course = storage.list('courses')[0];
  // Inscrit l’étudiant dans un cours
  storage.enroll(student.id, course.id);
  // Essaie de supprimer l’étudiant
  const result = storage.remove('students', student.id);
  // Vérifie que l’erreur est renvoyée
  expect(result).toEqual({
    error: 'Cannot delete student: enrolled in a course',
  });
});

test('unenroll should remove enrollment successfully', () => {
  const student = storage.list('students')[0];
  const course = storage.list('courses')[0];

  // On inscrit d’abord l’étudiant
  storage.enroll(student.id, course.id);

  // Vérifie qu’il est bien inscrit
  let courses = storage.getStudentCourses(student.id);
  expect(courses).toContainEqual(expect.objectContaining({ id: course.id }));

  // Désinscrit l’étudiant
  const result = storage.unenroll(student.id, course.id);
  expect(result).toEqual({ success: true });

  // Vérifie qu’il n’est plus inscrit
  courses = storage.getStudentCourses(student.id);
  expect(courses).not.toContainEqual(
    expect.objectContaining({ id: course.id }),
  );
});

test('unenroll should return error if enrollment not found', () => {
  const student = storage.list('students')[0];
  const course = storage.list('courses')[0];

  const result = storage.unenroll(student.id, course.id);
  expect(result).toEqual({ error: 'Enrollment not found' });
});
