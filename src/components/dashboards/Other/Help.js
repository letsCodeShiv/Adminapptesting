import React from "react";
import { Card } from "react-bootstrap";
import ReactMarkdown from "react-markdown";

const Help = () => {
  const HelpGuideContent = `

## Feature Page Access

### Group Settings for Intelligent Resolution and Analytics
To configure groups for the Intelligent Resolution and Analytics:
1. Navigate to the **Feature** page.
2. Select **Group for Intelligent Resolution and Analytics**.

### Group Settings for Feedback Survey
To enable groups for a feedback survey with the restriction that only groups enabled for Intelligent Resolution and Analytics can be selected:
1. Go to the **Feature** page.
2. Choose **Group for Feedback**.
3. Only groups that are enabled for the resolution will be available for selection.

## Managing Settings for Modules
To manage settings specific to any module:
1. Move to the **Feature** page.
2. Select **Manage Settings** and adjust settings module-wise as required.

## Knowledge Base Management for Chatbot
To add to the knowledge base for the chatbot:
1. Navigate to the **Feature** page.
2. Go to **Settings**.
3. Select **KB Ingestion**.

## Monitoring Data and Knowledge Base Ingestion Status
To check the status of data ingestion and knowledge base updates:
1. Visit the **Feature** page.
2. Go to **Resolution Screen Settings**.
3. Select **Ingestion Status** and **KB Status** to view the current status.

## Role and Permission Management
### Basic Role Management
To manage roles and permissions:
1. Navigate to **Role Management**.
2. Select **Manage Role and Permission**.
3. Activate roles such as **Agent**, add **Team Role**, and **Team Lead** as required.

### Prebuilt Roles
- The system includes three prebuilt roles with permissions that are not editable and cannot be deleted.
- There is a single **Account Owner** role that cannot be turned off.
- The **Agent** role can only be assigned to the number of agents purchased with your license.

---

This guide should help users navigate through the settings and features of your software more effectively.

`;
  return (
    <Card className="mb-3">
      <Card.Header className="bg-light">
        <h5 className="mb-0">Help Guide</h5>
      </Card.Header>

      <Card.Body className="text-justify text-1000 py-2 px-5">
        <p className="mb-0 mt-2">
          <ReactMarkdown>{HelpGuideContent}</ReactMarkdown>
        </p>
      </Card.Body>
    </Card>
  );
};

export default Help;
