import express, { Request, Response } from "express";
import Joi, { Schema } from "joi";
import { deposit, withdrawal } from "../handlers/transactionHandler";

const router = express.Router();

const transactionSchema: Schema = Joi.object({
  amount: Joi.number().required(),
});

const withdrawSchema: Schema = Joi.object({
  accountNumber: Joi.number().required(),
  amount: Joi.number().required(),
  accountAmount: Joi.number().required(),
  creditLimit: Joi.number().optional(),
  type: Joi.string().valid("checking", "savings", "credit").required(),
});

// const depositSchema: Schema = Joi.object({
//   amount: Joi.number().required(),
//   accountAmount: Joi.number().required(),
//   type: Joi.string().valid("checking", "savings", "credit").required(),
// });

const WITHDRAWAL_TRANSACTION_LIMIT = 200;
let sessionWithdrawals: Record<string, number> = {};

router.put(
  "/:accountID/withdraw",
  async (request: Request, response: Response) => {
    const { error } = withdrawSchema.validate(request.body);

    if (error) {
      return response.status(400).send(error.details[0].message);
    }
    const { accountID, amount, accountAmount, creditLimit, type } =
      request.body;
    const currentSessionTotal = sessionWithdrawals[accountID] || 0; 
    
    //Checking to see if it can be withdrawn in 5s before setting session amounts
    if (amount % 5 !== 0) {
      return response.status(400).send({
        error: "You can only withdraw amounts in multiples of $5.",
      });
    }
    
    const potentialTotal = currentSessionTotal + amount;


    const validations = [
      {
        condition:
          amount > WITHDRAWAL_TRANSACTION_LIMIT ||
          potentialTotal > WITHDRAWAL_TRANSACTION_LIMIT,
        message: "You cannot withdraw more than $200 in a single transaction.",
      },
      {
        condition:
          (type === "credit" && amount > accountAmount + (creditLimit || 0)) ||
          (type !== "credit" && amount > accountAmount),
        message:
          "Insufficient funds. You cannot withdraw more than your balance or credit limit.",
      },
      // {
      //   condition: dailyWithdrawal + amount > MAX_DAILY_LIMIT,
      //   message: "You cannot withdraw more than $400 in a 24-hour period.",
      // },
    ];

    for (const validation of validations) {
      if (validation.condition) {
        return response.status(400).send({ error: validation.message });
      }
    }

    sessionWithdrawals[accountID] = potentialTotal; 

    try {
      const updatedAccount = await withdrawal(
        request.params.accountID,
        request.body.amount
      );
      return response.status(200).send({
        sessionTotal: sessionWithdrawals[accountID],
        remainingLimit:
          WITHDRAWAL_TRANSACTION_LIMIT - sessionWithdrawals[accountID],
        updatedAccount,
      });
    } catch (err) {
      if (err instanceof Error) {
        return response.status(400).send({ error: err.message });
      }
    }
  }
);

router.put(
  "/:accountID/deposit",
  async (request: Request, response: Response) => {
    const { error } = transactionSchema.validate(request.body);

    if (error) {
      return response.status(400).send(error.details[0].message);
    }

    try {
      const updatedAccount = await deposit(
        request.params.accountID,
        request.body.amount
      );
      return response.status(200).send(updatedAccount);
    } catch (err) {
      if (err instanceof Error) {
        return response.status(400).send({ error: err.message });
      }
    }
  }
);

// router.put(
//   "/:accountID/signout",
//   async (request: Request, response: Response) => {
//     const { error } = transactionSchema.validate(request.body);

//     if (error) {
//       return response.status(400).send(error.details[0].message);
//     }

//     try {
//       const updatedAccount = await deposit(
//         request.params.accountID,
//         request.body.amount
//       );
//       return response.status(200).send(updatedAccount);
//     } catch (err) {
//       if (err instanceof Error) {
//         return response.status(400).send({ error: err.message });
//       }
//     }
//   }
// );

export default router;
