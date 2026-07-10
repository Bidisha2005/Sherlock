import { Request, Response } from "express";

export class HealthController {
  status = (_req: Request, res: Response): void => {
    res.json({
      status: "ok",
      service: "sherlock-ai-server",
      timestamp: new Date().toISOString()
    });
  };
}
