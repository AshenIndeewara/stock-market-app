import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET } from '../config/r2';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

/**
 * Uploads an image to Cloudflare R2
 * @param {string} localUri - The local URI of the image to upload
 * @param {string} userId - The user ID to use for the file name
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadImageToR2 = async (localUri: string, userId: string): Promise<string> => {
    console.log('Starting R2 upload for:', localUri);
    try {
        // 1. Fetch the file from local URI to get the blob
        console.log('Fetching blob from URI...');
        const response = await fetch(localUri);
        if (!response.ok) {
            throw new Error(`Failed to fetch file from URI: ${response.statusText}`);
        }
        const blob = await response.blob();
        console.log('Blob fetched, size:', blob.size);

        // 2. Convert Blob to ArrayBuffer
        const arrayBuffer = await new Response(blob).arrayBuffer();
        const fileContent = new Uint8Array(arrayBuffer);
        console.log('Converted to Uint8Array, length:', fileContent.length);

        const fileName = `profileImages/${userId}.jpg`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: fileName,
            Body: fileContent,
            ContentType: 'image/jpeg',
            // ACL: 'public-read', // R2 doesn't support ACLs the same way S3 does. Bucket policy controls access.
        });

        console.log('Sending PutObjectCommand to R2...');
        await r2Client.send(command);
        console.log('Upload successful');

        // Return the URL
        return `https://notes.subsl.top/${fileName}`;
    } catch (error: any) {
        console.error('Error uploading file to R2:', error);
        // Log more details if available
        if (error.message) console.error('Error Message:', error.message);
        if (error.stack) console.error('Error Stack:', error.stack);
        throw error;
    }
};
