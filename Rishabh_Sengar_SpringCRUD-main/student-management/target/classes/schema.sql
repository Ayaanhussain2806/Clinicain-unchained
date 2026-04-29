
DROP TABLE IF EXISTS students;
CREATE TABLE patients (
    id     INTEGER      NOT NULL AUTO_INCREMENT,  
    name   VARCHAR(100) NOT NULL,
    email  VARCHAR(150) NOT NULL UNIQUE,
    course VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
);
INSERT INTO patients (name, email, course) VALUES
    ('Alice Johnson',  'alice@example.com',  'Computer Science'),
    ('Bob Smith',      'bob@example.com',    'Data Science'),
    ('Carol Williams', 'carol@example.com',  'Cybersecurity');
