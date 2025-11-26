import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegPath);

const videoPath = path.join(process.cwd(), 'reference_video.mp4');
const outputPath = path.join(process.cwd(), 'reference_frame.png');

ffmpeg(videoPath)
    .screenshots({
        timestamps: ['2'], // 2 seconds in
        filename: 'reference_frame.png',
        folder: process.cwd(),
        size: '1280x720'
    })
    .on('end', () => {
        console.log('Screenshot taken');
    })
    .on('error', (err) => {
        console.error('Error:', err);
    });
