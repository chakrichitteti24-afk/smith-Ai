const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
const writeStream = fs.createWriteStream('JohnDoe_Resume.pdf');
doc.pipe(writeStream);

doc.fontSize(24).text('John Doe', { align: 'center' });
doc.moveDown();
doc.fontSize(14).text('Software Engineer | 5 Years Experience', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text('Summary: Passionate Full Stack Developer with experience in React, Node.js, and Cloud Infrastructure. Proven track record of building scalable web applications and optimizing system performance.');
doc.moveDown();
doc.text('Skills: JavaScript, TypeScript, React, Node.js, Express, MongoDB, AWS, Docker.');
doc.moveDown();
doc.text('Experience:');
doc.text('- Senior Engineer at TechCorp (2020 - Present): Led the migration from monolithic architecture to microservices.');
doc.text('- Web Developer at WebSolutions (2018 - 2020): Developed interactive frontend applications using React and Redux.');
doc.moveDown();
doc.text('Education:');
doc.text('- B.S. in Computer Science, State University, 2018');

doc.end();

writeStream.on('finish', () => {
  console.log('PDF flushed to disk successfully!');
});
