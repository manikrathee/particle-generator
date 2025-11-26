import getColors from 'get-image-colors';
import path from 'path';

const imagePath = path.join(process.cwd(), 'reference_frame.png');

getColors(imagePath).then(colors => {
    console.log('Dominant Colors:');
    colors.map(color => console.log(color.hex()));
});
