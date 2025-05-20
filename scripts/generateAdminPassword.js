import bcrypt from 'bcrypt';

const password = 'Admin123!';
bcrypt.hash(password, 10).then(hash => {
    console.log('Contraseña hasheada:', hash);
}); 