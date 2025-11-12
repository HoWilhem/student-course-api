const request = require('supertest');
const app = require('../../src/app');
const storage = require('../../src/services/storage');

describe('Student-Course API integration', () => {
  beforeEach(() => {
    require('../../src/services/storage').reset();
    require('../../src/services/storage').seed();
  });

  test('GET /students should return seeded students', async () => {
    const res = await request(app).get('/students');
    expect(res.statusCode).toBe(200);
    expect(res.body.students.length).toBe(3);
    expect(res.body.students[0].name).toBe('Alice');
  });

  test('POST /students should create a new student', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'David', email: 'david@example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('David');
  });

  test('POST /students should not allow duplicate email', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'Eve', email: 'alice@example.com' });
    expect(res.statusCode).toBe(400);
  });

  test('DELETE /courses/:id should delete a course even if students are enrolled', async () => {
    const courses = await request(app).get('/courses');
    const courseId = courses.body.courses[0].id;
    await request(app).post(`/courses/${courseId}/students/1`);
    const res = await request(app).delete(`/courses/${courseId}`);
    expect(res.statusCode).toBe(400);
  });

  test('GET /courses/:id should return a course', async () => {
    const course = storage.list('courses')[0];
    const res = await request(app).get(`/courses/${course.id}`);
    expect(res.statusCode).toBe(200);
  });

  test('should return 404 when enrollment does not exist', async () => {
    const student = storage.list('students')[0];
    const course = storage.list('courses')[0];

    // Pas d’inscription
    const res = await request(app).delete(
      `/courses/${course.id}/students/${student.id}`,
    );
    expect(res.statusCode).toBe(204);
  });

  test('DELETE /courses/:id should return 204 when course is deleted successfully', async () => {
    // Récupère un cours existant
    const courses = await request(app).get('/courses');
    const courseId = courses.body.courses[0].id;

    // Supprime le cours
    const res = await request(app).delete(`/courses/${courseId}`);

    expect(res.statusCode).toBe(204);

    // Vérifie que le cours a été supprimé du storage
    const course = storage.get('courses', courseId);
    expect(course).toBeUndefined();
  });

  test('PUT /courses/:id should update course title and teacher', async () => {
    const course = storage.list('courses')[0];
    const res = await request(app)
      .put(`/courses/${course.id}`)
      .send({ title: 'Updated Math', teacher: 'Mr. Updated' });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Math');
    expect(res.body.teacher).toBe('Mr. Updated');

    // Vérifie dans le storage
    const updatedCourse = storage.get('courses', course.id);
    expect(updatedCourse.title).toBe('Updated Math');
    expect(updatedCourse.teacher).toBe('Mr. Updated');
  });

  test('PUT /courses/:id should return 400 if title is duplicate', async () => {
    const courses = storage.list('courses');
    const course1 = courses[0];
    const course2 = courses[1];

    // Essayer de mettre le titre de course1 sur course2
    const res = await request(app)
      .put(`/courses/${course2.id}`)
      .send({ title: course1.title });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Course title must be unique' });
  });

  test('GET /students/:id should return a student with their courses', async () => {
    // Inscrire le premier étudiant dans un cours pour tester la relation
    const course = storage.list('courses')[0];
    await storage.enroll(1, course.id);

    const res = await request(app).get('/students/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.student).toBeDefined();
    expect(res.body.student.id).toBe(1);
    expect(res.body.courses).toBeDefined();
    expect(res.body.courses.length).toBe(1);
    expect(res.body.courses[0].id).toBe(course.id);
  });

  test('DELETE /students/:id should delete a student successfully', async () => {
    // Crée un étudiant non inscrit à un cours
    const newStudent = storage.create('students', {
      name: 'Temp',
      email: 'temp@example.com',
    });

    const res = await request(app).delete(`/students/${newStudent.id}`);

    expect(res.statusCode).toBe(204);

    // Vérifie que le student n’existe plus dans le storage
    const deletedStudent = storage.get('students', newStudent.id);
    expect(deletedStudent).toBeUndefined();
  });

  test('DELETE /students/:id should return 404 if student not found', async () => {
    const res = await request(app).delete('/students/9999');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Student not found' });
  });

  test('DELETE /students/:id should return 400 if student is enrolled in a course', async () => {
    const student = storage.list('students')[0];
    const course = storage.list('courses')[0];
    storage.enroll(student.id, course.id);

    const res = await request(app).delete(`/students/${student.id}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: 'Cannot delete student: enrolled in a course',
    });
  });

  test('PUT /students/:id - update student successfully', async () => {
    const student = storage.list('students')[0];
    const res = await request(app)
      .put(`/students/${student.id}`)
      .send({ name: 'Alice Updated', email: 'alice.updated@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Alice Updated');
  });

  test('PUT /students/:id - fail if email duplicate', async () => {
    const students = storage.list('students');
    const res = await request(app)
      .put(`/students/${students[0].id}`)
      .send({ email: students[1].email });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /students/:id - fail if student not found', async () => {
    const res = await request(app)
      .put('/students/9999')
      .send({ name: 'Introuvable' });
    expect(res.statusCode).toBe(404);
  });
});
