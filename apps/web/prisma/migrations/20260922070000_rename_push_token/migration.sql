-- La app Expo se retiró: los tokens de Expo Push ya no sirven y la tabla pasa a
-- llamarse PushToken (guarda los tokens de las apps nativas: apns:… y fcm:…).

DELETE FROM "ExpoPushToken" WHERE "token" LIKE 'Expo%';

ALTER TABLE "ExpoPushToken" RENAME TO "PushToken";
ALTER INDEX "ExpoPushToken_pkey" RENAME TO "PushToken_pkey";
ALTER INDEX "ExpoPushToken_token_key" RENAME TO "PushToken_token_key";
ALTER INDEX "ExpoPushToken_userId_idx" RENAME TO "PushToken_userId_idx";
ALTER TABLE "PushToken" RENAME CONSTRAINT "ExpoPushToken_userId_fkey" TO "PushToken_userId_fkey";
