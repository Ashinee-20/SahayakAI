export default function PrivacyPolicyPage() {
    return (
        <div>
            <h1>Privacy Policy for Sahayak</h1>
            <p><em>Last Updated: {new Date().toLocaleDateString()}</em></p>

            <h2>1. Introduction</h2>
            <p>
                Welcome to Sahayak. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>

            <h2>2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
            <ul>
                <li>
                    <strong>Personal Data:</strong> When you register using Google Sign-In, we collect personal information that you provide to Google, such as your name, email address, and profile picture.
                </li>
                <li>
                    <strong>Generated Content:</strong> We store the content you create using our AI tools, such as lesson plans, assessments, stories, and class notes. This content is linked to your user account.
                </li>
                <li>
                    <strong>Uploaded Files:</strong> We store files you upload, such as textbook PDFs, in your Firebase Storage bucket.
                </li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
                <li>Create and manage your account.</li>
                <li>Provide you with the services and features of the application.</li>
                <li>Save and display your generated content and uploaded files.</li>
                <li>Enable community sharing features, if you choose to share your content.</li>
            </ul>

            <h2>4. Sharing Your Information</h2>
            <p>
                We do not sell or rent your personal information to third parties. We may share information with third-party service providers that perform services for us or on our behalf, including Google (for authentication, Forms API) and Firebase (for database and storage).
            </p>
             <p>
                If you choose to share content in the Community Hub, that specific content will be visible to other users.
            </p>


            <h2>5. Security of Your Information</h2>
            <p>
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>

            <h2>6. Contact Us</h2>
            <p>
                If you have questions or comments about this Privacy Policy, please contact us. (You should add a contact method here).
            </p>
        </div>
    );
}
