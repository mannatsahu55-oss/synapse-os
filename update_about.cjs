const fs = require('fs');
const path = require('path');

const aboutPath = path.join(__dirname, 'public/framer/about.html');
let text = fs.readFileSync(aboutPath, 'utf8');

// Replace Images
text = text.replace(/\/images\/cnkfggbztabumxncpkkjh4apfnu\.png\?width=736&amp;height=1150/g, '/people_images/Hritik%20Raj.jpeg');
text = text.replace(/\/images\/w79djdhxuhf5kreegczi5unpu0c\.png\?width=736&amp;height=890/g, '/people_images/Mannat%20Kumar.jpeg');
text = text.replace(/\/images\/ci0d2qzhhoyjqyrsf6eziae10\.png\?width=736&amp;height=1104/g, '/people_images/Sachin%20Rana.jpg');
text = text.replace(/\/images\/j8vfayd9sisibkf1eldrrzgdm\.png\?width=736&amp;height=1104/g, '/people_images/Utsav%20Raj.jpeg');

// Replace Names
text = text.replace(/Stefan Holm/g, 'Hritik Raj');
text = text.replace(/Anders Jensen/g, 'Hritik Raj');

text = text.replace(/Ron Bilevich/g, 'Mannat Kumar');
text = text.replace(/Mateo Silva/g, 'Mannat Kumar');

text = text.replace(/Marek Novak/g, 'Sachin Rana');
text = text.replace(/Julian Krause/g, 'Sachin Rana');

text = text.replace(/Lukas Weber/g, 'Utsav Raj');
text = text.replace(/Thomas Wright/g, 'Utsav Raj');

fs.writeFileSync(aboutPath, text, 'utf8');
console.log('Updated about.html');
