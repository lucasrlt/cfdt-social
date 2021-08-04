import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export const RenderableError = (message) => ({
  renderable: true,
  message,
});

export const parse_csv = (path, callback, separator = ";") => {
  fs.createReadStream(path)
    .pipe(csv({ separator }))
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      callback(results);
    });
};

export const hash_password = (password, callback) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
};

export const check_password = (password, hash, callback) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

export const generate_password = () => {
  var pwdChars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var pwdLen = 12;
  var randPassword = Array(pwdLen)
    .fill(pwdChars)
    .map(function (x) {
      return x[Math.floor(Math.random() * x.length)];
    })
    .join("");
  return randPassword;
};

export const generate_jwt = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: 31556926 });
};

export const jwtVerify = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.sendStatus(403);
  }

  const token = header.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) res.sendStatus(403);
    else {
      req.user = user;
      console.log("Allez bébé");
      next();
    }
  });
};

export const generate_random_id = (length) => {
  var result = "";
  var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const store_file = (file) => {
  const id = generate_random_id(128);

  let extension = file.name.split(".");
  extension = extension[extension.length - 1];

  const filename = `${id}.${extension}`;
  file.mv(path.join(process.env.UPLOAD_PATH, filename));

  return filename;
};

export const delete_file = async (file) => {
  await fs.unlink(file, () => {});
};

export const check_file_size = (file, max_size) => {
  console.log("Alors", file.size, max_size, file.size / 1e6);
  if (file.size / 1e6 > max_size) {
    return false;
  }
  return true;
};

export const get_filepath = (filename) => {
  return path.join(process.env.UPLOAD_PATH, filename);
};

export const encrypt_message = (message) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", process.env.MSG_AES, iv);

  let encrypted = cipher.update(message);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return { iv: iv.toString("hex"), encrypted: encrypted.toString("hex") };
};

export const decrypt_message = (encrypted, iv) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    process.env.MSG_AES,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encrypted, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]).toString();

  return decrypted;
};

export const get_unique_hash = (id1, id2) => {
  const first_id = id1 < id2 ? id1 : id2;
  const second_id = id1 < id2 ? id2 : id1;

  const id = crypto
    .createHash("sha256")
    .update(first_id + second_id)
    .digest("hex");

  return id;
};
