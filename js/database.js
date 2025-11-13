// database.js


async function sqlQuery(rawSql)
{
    const dbPath = "https://pulsedb-pulseprog7314.aws-us-east-1.turso.io";
    const dbToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTY2NjEzODcsImlkIjoiM2ZmYmE5NGUtZDdjZS00ZDk1LTk1MTUtYWQwZGE3MjNhZGU4IiwicmlkIjoiYmIyMjZjYjgtYWY0Ny00M2YzLTg1MTUtN2Y4OGUwMjNhMzc3In0.Ujf1j9cSiDd-ND6Kx3YuZ14cjZAymjPSucSOE6Z4FkqvMAF6-1YB_1LQ9vbYAYLNC1r0BKJAmKIAQ_kp4jBCDQ";

    const response = await fetch(`${dbPath}/v2/pipeline`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${dbToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      requests: [
      {
        type: "execute",
        stmt: { sql: rawSql }
      },
      {
        type: "close"
      }
    ]
    })
  });

  const data = await response.json();

    if (data.results[0].response === undefined) {
        console.error("Database error response:", JSON.stringify(data.results[0].error, null, 2));
        console.error("Failing SQL Query:", rawSql);
        throw new Error("Database query failed. See console for details.");
    }

  return data.results[0].response.result;
}

function getValue(result, iRow, columnName)
{
  const rows = result.rows;
  const columns = result.cols;
  let iColumn = -1;

  for(let i = 0; i < columns.length; i++)
  {
    if(columns[i].name == columnName)
    {
      iColumn = i;
      break;
    }
  }

  const data = rows[iRow][iColumn].value;

  return data;
}

async function createUserAccount(userAccount)
{
    const sql1 = `SELECT userName FROM UserAccount WHERE userName = '${userAccount.userName}'`;
    const sql1Result = await sqlQuery(sql1);

    if(sql1Result.rows.length == 0)
    {
        const sql2 = `INSERT INTO UserAccount (firstName, lastName, emailAddress, phoneNumber, userName, gender, profileImage, password) VALUES ('${userAccount.firstName}', '${userAccount.lastName}', '${userAccount.emailAddress}', '${userAccount.phoneNumber}', '${userAccount.userName}', '${userAccount.gender}', '${userAccount.profileImage}', '${userAccount.password}')`;
        await sqlQuery(sql2);

        return true;
    }
    else
    {
        return false;
    }
}

async function authenticate(userName, password)
{
    const sql1 = `SELECT userName, password FROM UserAccount WHERE userName = '${userName}'`;
    const sql1Result = await sqlQuery(sql1);

    if(getValue(sql1Result, 0, "userName") == userName && getValue(sql1Result, 0, "password") == password)
    {
      return true;
    }
    else
    {
      return false;
    }
}

async function getUserById(userAccountId)
{
  const sql1 = `SELECT * FROM UserAccount WHERE UserAccountID = ${userAccountId}`;
  const sql1Result = await sqlQuery(sql1);

  const userObj = new Object();
  userObj.UserAccountID = getValue(sql1Result, 0, "UserAccountID");
  userObj.firstName = getValue(sql1Result, 0, "firstName");
  userObj.lastName = getValue(sql1Result, 0, "lastName");
  userObj.emailAddress = getValue(sql1Result, 0, "emailAddress");
  userObj.phoneNumber = getValue(sql1Result, 0, "phoneNumber");
  userObj.userName = getValue(sql1Result, 0, "userName");
  userObj.gender = getValue(sql1Result, 0, "gender");
  userObj.profileImage = getValue(sql1Result, 0, "profileImage");
  userObj.password = getValue(sql1Result, 0, "password");

  return userObj;
}

async function getUsersByIds(userIds) {
    if (!userIds || userIds.length === 0) {
        return [];
    }

    const sql = `SELECT * FROM UserAccount WHERE UserAccountID IN (${userIds.join(',')})`;
    const result = await sqlQuery(sql);

    const users = [];
    for (let i = 0; i < result.rows.length; i++) {
        const userObj = {
            UserAccountID: getValue(result, i, "UserAccountID"),
            firstName: getValue(result, i, "firstName"),
            lastName: getValue(result, i, "lastName"),
            emailAddress: getValue(result, i, "emailAddress"),
            phoneNumber: getValue(result, i, "phoneNumber"),
            userName: getValue(result, i, "userName"),
            gender: getValue(result, i, "gender"),
            profileImage: getValue(result, i, "profileImage"),
            password: getValue(result, i, "password")
        };
        users.push(userObj);
    }

    return users;
}

async function getUserByName(userName)
{
  const sql1 = `SELECT * FROM UserAccount WHERE userName = '${userName}'`;
  const sql1Result = await sqlQuery(sql1);

  const userObj = new Object();
  userObj.UserAccountID = getValue(sql1Result, 0, "UserAccountID");
  userObj.firstName = getValue(sql1Result, 0, "firstName");
  userObj.lastName = getValue(sql1Result, 0, "lastName");
  userObj.emailAddress = getValue(sql1Result, 0, "emailAddress");
  userObj.phoneNumber = getValue(sql1Result, 0, "phoneNumber");
  userObj.userName = getValue(sql1Result, 0, "userName");
  userObj.gender = getValue(sql1Result, 0, "gender");
  userObj.profileImage = getValue(sql1Result, 0, "profileImage");
  userObj.password = getValue(sql1Result, 0, "password");

  return userObj;
}

async function getUserChatList(userAccountId)
{
    const sql = `
        SELECT c.UserAccountID FROM Message t JOIN IndividualChat c ON t.MessageID = c.MessageID WHERE t.UserAccountID = ${userAccountId}
        UNION
        SELECT t.UserAccountID FROM IndividualChat c JOIN Message t ON c.MessageID = t.MessageID WHERE c.UserAccountID = ${userAccountId}
    `;

    const result = await sqlQuery(sql);

    const chatList = [];
    for (let i = 0; i < result.rows.length; i++) {
        chatList.push(getValue(result, i, "UserAccountID"));
    }

    return chatList;
}

async function sendMessage(senderId, receiverId, content, isHtml, attachments)
{
  const isHtmlValue = isHtml ? 1 : 0;
  // --- THIS QUERY HAS BEEN UPDATED ---
  const sql1 = `INSERT INTO Message (UserAccountID, textMessage, isHtml, type, voiceNoteRef) VALUES (${senderId}, '${content}', ${isHtmlValue}, 'text', '')`;
  await sqlQuery(sql1);

  const sql2 = "SELECT last_insert_rowid() AS ROW_ID";
  const sql2Result = await sqlQuery(sql2);
  const rowId = getValue(sql2Result, 0, "ROW_ID");

  const sql3 = `INSERT INTO IndividualChat (MessageID, UserAccountID) VALUES (${rowId}, ${receiverId})`;
  await sqlQuery(sql3);
}

async function getMessages(senderId, receiverId)
{
  const sql1 = `SELECT t.UserAccountID AS senderId, c.UserAccountID AS receiverId, t.MessageID, t.textMessage, t.isHtml FROM Message t INNER JOIN IndividualChat c ON t.MessageID = c.MessageID WHERE (t.UserAccountID = ${senderId} AND c.UserAccountID = ${receiverId}) OR (t.UserAccountID = ${receiverId} AND c.UserAccountID = ${senderId})`;
  const sql1Result = await sqlQuery(sql1);

  const messages = [];

  for(let i = 0; i < sql1Result.rows.length; i++)
  {
    const message = new Object();
    message.senderId = getValue(sql1Result, i, "senderId");
    message.receiverId = getValue(sql1Result, i, "receiverId");
    message.messageId = getValue(sql1Result, i, "MessageID");
    message.content = getValue(sql1Result, i, "textMessage");
    message.isHtml = getValue(sql1Result, i, "isHtml");

    messages.push(message);
  }

  return messages;
}

async function readMessage(messageId)
{
  const sql1 = `SELECT * FROM Message WHERE MessageID = ${messageId}`;
  const sql1Result = await sqlQuery(sql1);

  const obj = new Object();
  obj.content = getValue(sql1Result, 0, "textMessage");
  obj.isHtml = getValue(sql1Result, 0, "isHtml");

  return obj;
}