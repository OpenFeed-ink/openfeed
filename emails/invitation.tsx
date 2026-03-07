import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  pixelBasedPreset
} from '@react-email/components';

interface InvitationEmailProps {
  inviterName: string;
  projectName: string;
  role: "ADMIN" | "MEMBER";
  acceptUrl: string;
  email: string;
}

export const InvitationEmail = ({
  inviterName,
  projectName,
  role,
  acceptUrl,
  email,
}: InvitationEmailProps) => {
  const previewText = `Join ${projectName} on OpenFeed`;
  const baseUrl = process.env.BETTER_AUTH_URL
    ? `https://${process.env.BETTER_AUTH_URL}`
    : '';
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind config={{
        presets: [pixelBasedPreset],
      }}>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-8 px-4 max-w-max-w-150">
            {/* Header with logo */}
            <Section className="text-center mb-8">
              <Img
                src={`${baseUrl}/static/openfeed.png`}
                alt="OpenFeed"
                width="70"
                height="70"
                className="mx-auto"
              />
            </Section>
            {/* Main card */}
            <Section className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">

              <Heading className="text-2xl font-bold text-gray-900 mb-4">
                You've been invited to join {projectName}
              </Heading>
              <Text className="text-gray-600 mb-6">
                <strong>{inviterName}</strong> has invited you to join the team on OpenFeed as a{" "}
                <strong>{role === "ADMIN" ? "Administrator" : "Member"}</strong>.
              </Text>


              <Text className="text-gray-600 mb-6">
                OpenFeed is the open source feedback, roadmap, and changelog platform. As a team member, you'll be able to:
              </Text>

              <ul className="list-disc pl-6 text-gray-600 mb-6">
                <li>Review and manage feedback</li>
                <li>Update the roadmap</li>
                <li>Publish changelog entries</li>
                <li>Respond to user comments</li>
              </ul>

              <Section className="text-center mb-6">
                <Button
                  href={acceptUrl}
                  className="bg-emerald-600 select-none cursor-pointer text-white font-medium py-3 px-6 rounded-lg no-underline text-center"
                >
                  Accept Invitation
                </Button>
              </Section>

              <Text className="text-gray-500 text-sm text-center">
                This invitation expires in 1 days.
              </Text>

              <Hr className="my-6 border-gray-200" />

              <Text className="text-gray-500 text-xs text-center">
                If you didn't expect this invitation, you can safely ignore this email.
                The invitation was sent to {email}.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="text-center mt-8">
              <Text className="text-gray-400 text-xs">
                © {new Date().getFullYear()} OpenFeed. All rights reserved.
                <br />
                <Link href="https://openfeed.ink" className="text-teal-600 no-underline">
                  openfeed.ink
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default InvitationEmail;
