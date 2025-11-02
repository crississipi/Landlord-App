import bcrypt from "bcrypt";

async function hashPassword() {
  const plainPassword = "chroinfur12";
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  console.log("Hashed password:", hashedPassword);
}

hashPassword();
