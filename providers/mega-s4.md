# MEGA S4 Object Storage Setup Guide

This guide explains how to configure **MEGA S4** access for use with AeroFTP. MEGA S4 is an S3-compatible object storage service that requires a MEGA **Pro** account or higher.

Follow the steps in this order to correctly configure your environment.

## 1. Access S4 Settings

1. Log in to your MEGA account via browser.
2. Go to **Settings** (gear icon in the top right or via the profile menu).
3. In the left sidebar, expand the **Object storage** section and click on **Endpoints**.

Here you will find the list of available **Endpoints** (e.g., `s3.eu-central-1.s4.mega.io`). Take note of the endpoint closest to your geographical location; you will need it for configuration.

![S4 Settings](/images/providers/mega-s4/01_settings_s4.png)

## 2. Create a Bucket

The first operational step is to create the container (bucket) where your files will be saved.

1. Remaining in the **Object storage** section, ensure you are in the main view or click on the folder/bucket icon (Drive -> Object storage).
2. Click the **Create bucket** button.
3. Enter a name for the bucket (e.g., `my-bucket`). Choose an identifying name for your project.
4. Click **Create** to confirm.

![Create Bucket](/images/providers/mega-s4/05_create_bucket.png)

## 3. Create Access Keys

Now that you have a bucket ready, you need to generate security keys to allow AeroFTP to connect to your MEGA S4 account.

1. Return to **Settings** > **Object storage** and click on **Access keys** in the submenu.
2. Click the **Manage keys** button to access the management screen.
3. In the top left, click **+ Create key**.

![Manage Keys](/images/providers/mega-s4/02_keys_management.png)

4. Enter a descriptive name for the key (e.g., `my_megaS4_key`).
5. Select **Root user** to ensure the key has access to the bucket you just created.
6. Click **Next**.

![Create Key](/images/providers/mega-s4/03_create_key_modal.png)

7. **IMPORTANT**: At this point, the **Access key** and **Secret key** will be generated and displayed.
   - Copy **both** codes securely.
   - The **Secret key** will never be shown again for security reasons. You can click **Download** to save a file containing the credentials.
8. Once you have saved the credentials, close the window.

![Key Credentials](/images/providers/mega-s4/04_key_credentials.png)

## 4. Configuration in AeroFTP

Now you have all the necessary parameters to configure the connection in AeroFTP. Create a new profile and fill in the fields as follows:

- **Protocol**: S3 (S3 Compatible)
- **Endpoint**: The URL noted in step 1 (e.g., `s3.eu-central-1.s4.mega.io`)
- **Access Key**: The key generated in step 3.
- **Secret Key**: The secret key generated in step 3.
- **Region**: You can leave this empty or enter the region portion of the endpoint (e.g., `eu-central-1`).
- **Bucket**: The name of the bucket created in step 2 (e.g., `my-bucket`).

## Features

- **S3-compatible**: Full S3 API support for standard object operations.
- **High Performance**: Optimized for massive transfers with zero-knowledge encryption.
- **Server-side copy**: Move and copy files without downloading.

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [MEGA](/providers/mega)

> [!TIP]
> MEGA S4 is a premium service. Ensure your subscription is active to avoid connection errors. Always keep your Secret Key in a safe place!
