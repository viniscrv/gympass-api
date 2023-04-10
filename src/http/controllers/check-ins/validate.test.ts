import { afterAll, beforeAll, describe, expect, test } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { createAndAutheticateUser } from "@/utils/test/create-and-autheticate-user";
import { prisma } from "@/lib/prisma";

describe("Validate Check-in (2e2)", () => {

    beforeAll(async () => {
        await app.ready();
    });
    afterAll(async () => {
        await app.close();
    });

    test("should be able to validate a check-in", async () => {

        const { token } = await createAndAutheticateUser(app);

        const user = await prisma.user.findFirstOrThrow();

        const gym = await prisma.gym.create({
            data: {
                title: "Test Gym",
                latitude: -27.2092052,
                longitude: -49.6401091
            }
        });

        let checkIn = await prisma.checkIn.create({
            data: {
                gym_id: gym.id,
                user_id: user.id
            }
        });

        const response = await request(app.server)
            .patch(`/check-ins/${checkIn.id}/validate`)
            .set("Authorization", `Bearer ${token}`)
            .send();

        expect(response.statusCode).toEqual(204);

        checkIn = await prisma.checkIn.findUniqueOrThrow({
            where: {
                id: checkIn.id
            }
        });

        expect(checkIn.validated_at).toEqual(expect.any(Date));
    });
});