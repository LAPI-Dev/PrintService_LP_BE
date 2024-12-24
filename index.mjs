import puppeteer from "puppeteer";
import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const port = 3000;

// Tentukan __dirname karena ES Modules tidak mendukungnya langsung
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logo_lapi_imagePath = path.join(__dirname, 'public/assets/logo-lapi.png');
const logo_lapi_base64Image = fs.readFileSync(logo_lapi_imagePath, { encoding: 'base64' });

app.use(express.static(path.join(__dirname, 'public')));

app.get("/isi", (req, res) => {  
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get("/", (req, res) => { 
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Catatan Trial</title>
        <link rel="stylesheet" href="./assets/index-BVhUPZrk.css">
    </head>
    <body>
    <div class="w-full flex justify-between items-stretch">
      <div class="flex justify-center items-center border border-gray-500">
          <div class="w-[140px] h-[70px] overflow-hidden flex justify-center items-center">
              <img src="./assets/logo-lapi.png" alt="lapilogo">
              </div>
          </div>
          <div class="border-y border-y-gray-500 w-full h-100 flex flex-col bg-white border border-gray-500">
              <div class="text-sm px-4 text-center flex-1 flex items-center justify-center py-2">
                  <h1 class="font-bold flex flex-col justify-center items-center">
                      <span>
                          ${msg}
                      </span>
                  </h1>
              </div>
          </div>
      </div>
      </body>
      </html>
    `);
});

// coba di URL ketik : http://localhost:3000/print?foo_tgl=01-01-2024&foo_no=FO.RD.000012
app.get("/print", async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  /**
   * terima data untuk diisi ke header-footer, bisa dgn GET, bisa dgn POST, pilih salah satu.
   */
  
  const header_title = req.query.head_title || 'Default message'; // ini dgn GET
// const header_title= req.body.head_title || 'Default message'; // ini dgn POST,  judul form

  const footer_no = req.query.foo_no || 'Default message'; // ini dgn GET
  // const footer_no= req.body.foo_no || 'Default message'; // ini dgn POST,  FO.RD.000012

  const footer_tgl = req.query.foo_tgl || 'Default message'; // ini dgn GET
  const footer_rev = req.query.foo_rev || '00'; // ini dgn GET


  await page.goto("http://localhost:3000/isi");
  //await page.goto("http://192.168.1.159:8082/tst/test.html");
  //await page.addStyleTag({ path: 'test.css' }); 
  await page.pdf({
    path: "example.pdf",
    format: "A4",
    displayHeaderFooter: true,
    printBackground: true,
    footerTemplate: `
      <table style="width: 90%; margin: 0 auto; font-size: 12px; border: 1px solid gray; border-collapse: collapse;">
        <tr>
          <td style="border: 1px solid gray; width: 15%; text-align: center;">Nomor</td>
          <td style="border: 1px solid gray; width: 15%; text-align: center;">${footer_no}</td>
          <td style="border: 1px solid gray; width: 15%; text-align: center;">Tanggal</td>
          <td style="border: 1px solid gray; width: 15%; text-align: center;">${footer_tgl}</td>
          <td style="border: 1px solid gray; width: 12.5%; text-align: center;">Revisi</td>
          <td style="border: 1px solid gray; width: 5%; text-align: center;">${footer_rev}</td>
          <td style="border: 1px solid gray; width: 12.5%; text-align: center;">Halaman</td>
          <td style="border: 1px solid gray; width: 10%; text-align: center;"><span class="pageNumber"></span> dari <span class="totalPages"></span></td>
        </tr>
      </table>
    `,
    headerTemplate: `
    
    <table style="width: 90%; margin: 0 auto; font-size: 12px; border: 1px solid gray; border-collapse: collapse;">
        <tr>
          <td style="border: 1px solid gray; width: 140px; height: 70px; text-align: center;"><img src="data:image/png;base64,${logo_lapi_base64Image}" alt="lapilogo"  width="100" ></td>
          <td style="border: 1px solid gray; height: 100px; text-align: center;">
            <h1 class="font-bold flex flex-col justify-center items-center">
                      <span>
                          ${header_title}
                      </span>
                  </h1>
          </td>
        </tr>
      </table>
    
    `,
    margin: { bottom: '50px', top: '150px', left:"50px", right:"50px" },
  });
  await browser.close();

  res.send("print done");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
