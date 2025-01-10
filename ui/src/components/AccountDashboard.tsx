import React, { useState } from "react";
import { account } from "../Types/Account";
import Paper from "@mui/material/Paper/Paper";
import {
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

type AccountDashboardProps = {
  account: account;
  signOut: () => Promise<void>;
};

export const AccountDashboard = (props: AccountDashboardProps) => {
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [account, setAccount] = useState(props.account);
  const [error, setError] = useState<string | null>(null);

  const { signOut } = props;

  const depositFunds = async () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: depositAmount }),
    };

    try {
      const response = await fetch(
        `http://localhost:3000/transactions/${account.accountNumber}/deposit`,
        requestOptions
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          errorData.error || "An unexpected error occurred during withdrawal."
        );
        return;
      }

      const data = await response.json();

      setAccount({
        accountNumber: data.account_number,
        name: data.name,
        amount: data.amount,
        type: data.type,
        creditLimit: data.credit_limit,
      });
      setError(null);
    } catch {
      setError("An unexpected error occurred during deposit.");
    }
  };

  const withdrawFunds = async () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountNumber: account.accountNumber,
        amount: withdrawAmount,
        accountAmount: account.amount || 0,
        creditLimit: account.creditLimit || 0,
        type: account.type,
      }),
    };

    try {
      const response = await fetch(
        `http://localhost:3000/transactions/${account.accountNumber}/withdraw`,
        requestOptions
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          errorData.error || "An unexpected error occurred during withdrawal."
        );
        return;
      }

      const data = await response.json();

      setAccount({
        accountNumber: data.updatedAccount.account_number,
        name: data.updatedAccount.name,
        amount: data.updatedAccount.amount,
        type: data.updatedAccount.type,
        creditLimit: data.updatedAccount.credit_limit,
      });
      setError(null);
    } catch {
      setError("An unexpected error occurred during withdrawal.");
    }
  };

  const handleSignOut = async () => {
    try {
       const response = await fetch(
         `http://localhost:3000/transactions/${account.accountNumber}/signout`,
         {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ accountID: account.accountNumber }),
         }
       );

      if (!response.ok) {
        setError("An error occurred while signing out.");
        return;
      }

      await signOut();
      setError(null);
    } catch {
      setError("An unexpected error occurred while signing out.");
    }
  };

  return (
    <Paper className="account-dashboard">
      <div className="dashboard-header">
        <h1>Hello, {account.name}!</h1>
        <Button variant="contained" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
      <h2>Balance: ${account.amount}</h2>
      {error && (
        <Typography color="error" align="center" marginBottom={2}>
          {error}
        </Typography>
      )}
      <Grid container spacing={2} padding={2}>
        <Grid item xs={6}>
          <Card className="deposit-card">
            <CardContent>
              <h3>Deposit</h3>
              <TextField
                label="Deposit Amount"
                variant="outlined"
                type="number"
                sx={{
                  display: "flex",
                  margin: "auto",
                }}
                onChange={(e) => setDepositAmount(+e.target.value)}
              />
              <Button
                variant="contained"
                sx={{
                  display: "flex",
                  margin: "auto",
                  marginTop: 2,
                }}
                onClick={depositFunds}
              >
                Submit
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card className="withdraw-card">
            <CardContent>
              <h3>Withdraw</h3>
              <TextField
                label="Withdraw Amount"
                variant="outlined"
                type="number"
                sx={{
                  display: "flex",
                  margin: "auto",
                }}
                onChange={(e) => setWithdrawAmount(+e.target.value)}
              />
              <Button
                variant="contained"
                sx={{
                  display: "flex",
                  margin: "auto",
                  marginTop: 2,
                }}
                onClick={withdrawFunds}
              >
                Submit
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};
