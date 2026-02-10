import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { S3Client } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '111111';
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '111111';
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '1111111';

export const R2_BUCKET ='11111111';
export const R2_PUBLIC_URL_BASE = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}`; // Note: This is the S3 endpoint, usually for public access you'd use a custom domain or a worker.


export const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});
