const s = require('../services/storage');

/**
 * @swagger
 * tags:
 *   name: Étudiants
 *   description: Gestion des étudiants
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Liste des étudiants
 *     tags: [Étudiants]
 *     responses:
 *       200:
 *         description: OK
 */
exports.listStudents = (req, res) => {
  let students = s.list('students');
  const { name, email, page = 1, limit = 10 } = req.query;
  if (name) students = students.filter((st) => st.name.includes(name));
  if (email) students = students.filter((st) => st.email.includes(email));
  const start = (page - 1) * limit;
  const paginated = students.slice(start, start + Number(limit));
  res.json({ students: paginated, total: students.length });
};

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Récupérer un étudiant
 *     tags: [Étudiants]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Non trouvé
 */
exports.getStudent = (a, b) => {
  const c = s.get('students', a.params.id);
  if (!c) return b.status(404).json({ error: 'Student not found' });
  const courses = s.getStudentCourses(a.params.id);
  return b.json({ student: c, courses });
};

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Créer un étudiant
 *     tags: [Étudiants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *     responses:
 *       201:
 *         description: Créé
 *       400:
 *         description: Données invalides
 */
exports.createStudent = (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: 'name and email required' });
  const result = s.create('students', { name, email });
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(201).json(result);
};

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Mettre à jour un étudiant
 *     tags: [Étudiants]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Non trouvé
 */
exports.updateStudent = (req, res) => {
  const student = s.get('students', req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const { name, email } = req.body;
  if (
    email &&
    s.list('students').find((st) => st.email === email && st.id !== student.id)
  ) {
    return res.status(400).json({ error: 'Email must be unique' });
  }
  if (name) student.name = name;
  if (email) student.email = email;
  return res.json(student);
};

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Supprimer un étudiant
 *     tags: [Étudiants]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Supprimé
 *       404:
 *         description: Non trouvé
 */
exports.deleteStudent = (req, res) => {
  const result = s.remove('students', req.params.id);
  if (result === false)
    return res.status(404).json({ error: 'Student not found' });
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(204).send();
};