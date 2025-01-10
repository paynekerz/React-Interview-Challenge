## Questions

### What issues, if any, did you find with the existing codes

While developing, I found some lingering console.log statements in the code, which could lead to cluttered logs in a production environment. 
Moreover, there was a lack of robust error handling in both the frontend and backend. To address this, I implemented try-catch blocks and enhanced validation logic to 
ensure that errors were properly caught and handled, providing clear feedback to users and maintaining application stability.

### What issues, if any, did you find with the request to add functionality?

The initial request to implement functionality for limiting session withdrawals and deposits presented some challenges due to ambiguities in the requirements. 
Specifically, the request lacked clarity on how certain edge cases should be handled. For instance, it was not explicitly stated what should occur if a user 
attempted to make multiple deposits or withdrawals below the individual transaction limit but accumulated a total exceeding the session limit.

### Would you modify the structure of this project if you were to start it over? If so, how?

If I were to start over this project i would make a few modifications. First, I would introduce clear API contracts using tools like Swagger or Postman
documentation to define and document endpoints comprehensively. This would ensure better communication between the frontend and backend teams and provide a reliable reference for API usage.
Second, I would implement a database migration tool, such as knex or sequelize, to manage database schema changes. This would ensure synchronization between the codebase and the database,
making it easier to handle updates and maintain consistency across environments. Third, I would focus on better organization by modularizing the project. Grouping related components, routes,
and handlers into dedicated modules would improve maintainability and make the codebase more intuitive to navigate. Finally, I would improve error handling by implementing a global error-handling 
middleware for backend routes. This would allow for standardized error responses and simplify debugging and logging.

### Were there any pieces of this project that you were not able to complete that you'd like to mention?

Yes, there was one key piece of functionality that I was unable to complete: preventing users from withdrawing more than $400 in a single day. While I made significant progress toward this goal, I wasn't unable to fully integrate 
the solution within the project’s timeline. To address this goal, I created a util that tracks daily withdrawals by storing the total amount withdrawn and the date of the last transaction. This code makes it so that that 
total resets for each user at the start of a new day. However, I was unable to properly integrate this with the withdrawal endpoint in time. The commented-out sections of the code where this functionality was intended to be
implemented can be found in the project. Also, you can find the code for the util below

```
const dailyWithdrawals: Record<string, { total: number; date: string }> = {};

export const getDailyWithdrawal = async (
  accountID: string
): Promise<number> => {
  const today = new Date().toISOString().split("T")[0];
  const record = dailyWithdrawals[accountID];
  console.log(record.total);
  if (record && record.date === today) {
    console.log(record.total);
    return record.total;
  }

  dailyWithdrawals[accountID] = { total: 0, date: today };
  return 0;
};

export const updateDailyWithdrawal = async (
  accountID: string,
  newTotal: number
): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  dailyWithdrawals[accountID] = { total: newTotal, date: today };
};

```

### If you were to continue building this out, what would you like to add next?

If I were to continue building this project, there are several features and improvements I would prioritize to enhance functionality, security, and scalability. First, I would implement user authentication and authorization to secure API endpoints, 
ensuring that only authorized users can access or modify sensitive data. Second, I would focus on comprehensive testing by adding automated test coverage for all API endpoints and frontend components. This would improve reliability and reduce the risk of introducing bugs.
Third, I would enhance the frontend by improving the UI/UX to provide better visibility for error messages and success notifications. Fourth, I would optimize Docker configurations to streamline the build process and prevent redundant layers, 
making the development and deployment processes more efficient. And finally, I would address scalability by introducing a caching mechanism, such as Redis, to handle frequently accessed data. This would reduce the load on the backend and improve response times, especially as the user base grows.

### If you have any other comments or info you'd like the reviewers to know, please add them below.

I created a new Dockerfile in the root folder so you should be able to run `docker run build` and `docker compose up -d` in the console of the root folder.
The project was a great opportunity to explore and fix integration issues between the frontend, backend, and database layers. Thank you for letting my participate!