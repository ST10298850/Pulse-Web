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
    // Check if the user account exists.
    const sql1 = `SELECT userName FROM UserAccount WHERE userName = '${userAccount.userName}'`;
    const sql1Result = await sqlQuery(sql1);

    if(sql1Result.rows.length == 0)
    {
        // The user account does not exist.
        const sql2 = `INSERT INTO UserAccount (firstName, lastName, emailAddress, phoneNumber, userName, gender, profileImage, password) VALUES ('${userAccount.firstName}', '${userAccount.lastName}', '${userAccount.emailAddress}', '${userAccount.phoneNumber}', '${userAccount.userName}', '${userAccount.gender}', '${userAccount.profileImage}', '${userAccount.password}')`;
        await sqlQuery(sql2);

        return true;
    }
    else
    {
        // The user does exist.
        return false;
    }
}

async function authenticate(userName, password)
{
    // Check if the user account exists.
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
  userObj.UserAccountID = getValue(sql1Result, "UserAccountID");
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

function containsElement(array, element)
{
  let result = false;

  for(let i = 0; i < array.length; i++)
  {
    if(array[i] == element)
    {
      result = true;
      break;
    }
  }

  return result;
}

async function getUserChatList(userAccountId)
{
  const sql1 = `SELECT * FROM TextMessage WHERE UserAccountID = ${userAccountId}`;
  const sql1Result = await sqlQuery(sql1);

  const sql2 = `SELECT COUNT(*) AS ROW_COUNT FROM TextMessage WHERE UserAccountID = ${userAccountId}`;
  const sql2Result = await sqlQuery(sql2);
  const rowCount = getValue(sql2Result, 0, "ROW_COUNT");

  const chatList = [];

  for(let i = 0; i < rowCount; i++)
  {
    const textMessageId = getValue(sql1Result, i, "TextMessageID");
    const sql3 = `SELECT * FROM IndividualChat WHERE TextMessageID = ${textMessageId}`
    const sql3Result = await sqlQuery(sql3);
    const recipientUser = getValue(sql3Result, 0, "UserAccountID");

    if(!containsElement(messages, recipientUser))
      chatList[chatList.length] = recipientUser;
  }

  const sql4 = `SELECT * FROM IndividualChat WHERE UserAccountID = ${userAccountId}`;
  const sql4Result = await sqlQuery(sql4);

  const sql5 = `SELECT COUNT(*) AS ROW_COUNT FROM IndividualChat WHERE UserAccountID = ${userAccountId}`;
  const sql5Result = await sqlQuery(sql5);
  const rowCount2 = getValue(sql5Result, 0, "ROW_COUNT");

  for(let i = 0; i < rowCount2; i++)
  {
    const textMessageId = getValue(sql5Result, i, "TextMessageID");
    const sql3 = `SELECT * FROM TextMessage WHERE TextMessageID = ${textMessageId}`
    const sql3Result = await sqlQuery(sql3);
    const recipientUser = getValue(sql3Result, 0, "UserAccountID");

    if(!containsElement(messages, recipientUser))
      chatList[chatList.length] = recipientUser;
  }

  return chatList;
}

async function sendMessage(senderId, receiverId, content, isHtml, attachments)
{
  const sql1 = `INSERT INTO TextMessage (UserAccountID, textMessage, isHtml) VALUES (${senderId}, '${content}', ${isHtml})`;
  await sqlQuery(sql1);

  const sql2 = "SELECT last_insert_rowid() AS ROW_ID";
  const sql2Result = await sqlQuery(sql2);
  const rowId = getValue(sql2Result, 0, "ROW_ID");

  const sql3 = `INSERT INTO IndividualChat (TextMessageID, UserAccountID) VALUES (${rowId}, ${receiverId})`;
  await sqlQuery(sql3);
}

async function getMessages(senderId, receiverId)
{
  const sql1 = `SELECT t.UserAccountID AS senderId, c.UserAccountId AS receiverId, t.TextMessageID, t.textMessage, t.isHtml FROM TextMessage t INNER JOIN IndividualChat c ON t.TextMessageID = c.TextMessageID WHERE (t.UserAccountID = ${senderId} AND c.UserAccountID = ${receiverId}) OR (t.UserAccountID = ${receiverId} AND c.UserAccountID = ${senderId})`;
  const sql1Result = await sqlQuery(sql1);

  const messages = [];

  for(let i = 0; i < sql1Result.rows.length; i++)
  {
    const message = new Object();
    message.senderId = getValue(sql1Result, i, "senderId");
    message.receiverId = getValue(sql1Result, i, "receiverId");
    message.textMessageId = getValue(sql1Result, i, "TextMessageID");
    message.content = getValue(sql1Result, i, "textMessage");
    message.isHtml = getValue(sql1Result, i, "isHtml");

    messages[messages.length] = message;
  }

  return messages;
}

async function readMessage(textMessageId)
{
  const sql1 = `SELECT * FROM TextMessage WHERE TextMessageID = ${textMessageId}`;
  const sql1Result = await sqlQuery(sql1);

  const obj = new Object();
  obj.content = getValue(sql1Result, 0, "textMessage");
  obj.isHtml = getValue(sql1Result, 0, "isHtml");

  return obj;
}