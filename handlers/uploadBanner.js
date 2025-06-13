// Importing s3 modules from AWS SDK
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// crearting an S3 client instance with the specified region
const s3Client = new S3Client({
	region: process.env.AWS_REGION,
});

// Lambda handler function to generate a signed URL for uploading a banner image to S3
exports.handler = async (event) => {
	try {
		// Extracting the bucket name and key from the event object
		const bucketName = process.env.BUCKET_NAME;

		// Parsing the incoming event body to get filename and content type
		const { fileName, fileType } = JSON.parse(event.body);

		// Validating the presence of fileName and fileType
		if (!fileName || !fileType) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: 'File name and type are required.' }),
			};
		}

		// Creating an s3 PutObjectCommand with the specified bucket, key, and content type
		const command = new PutObjectCommand({
			Bucket: bucketName,
			Key: fileName,
			ContentType: fileType,
		});

		// Generating a signed URL for the PutObjectCommand
		const signedUrl = await getSignedUrl(s3Client, command, {
			expiresIn: 3600, // URL valid for 1 hour
		});

		// Returning the signed URL in the response
		return {
			statusCode: 200,
			body: JSON.stringify({
				signedUrl,
			}),
		};
	} catch (error) {
		// Handling errors and returning a 500 status code with the error message
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Failed to generate signed URL.', details: error.message }),
		};
	}
};
