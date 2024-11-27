
CREATE TABLE userprogpt (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(500) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    isVerified BOOLEAN,  
    PRIMARY KEY (id),
    UNIQUE KEY email (email)
);

CREATE TABLE chat_gpt (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    metas VARCHAR(255),
    favorito BOOLEAN NOT NULL
);


