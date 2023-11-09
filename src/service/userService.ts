// UserService.ts
import { Service } from 'typedi';
import { GoodReadsUser } from '../entity/goodReadsUser';
import { AppDataSource } from '../db/postgresConfig';
import AWS from 'aws-sdk';

@Service()
export class UserService {
    private userRepository = AppDataSource.getRepository(GoodReadsUser);
    private cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

    async findOneById(id: string): Promise<GoodReadsUser | null> {
        const user = await this.userRepository.findOne({ where: { id: id } });
        if (!user) {
            console.log("unregistered user");
            return null;
        }
        return user;
    }

    async updateUser(id: string, goodreadsName: string, goodreadsID: string): Promise<GoodReadsUser> {
        const user = new GoodReadsUser();
        user.id = id;
        user.goodreadsID = goodreadsID;
        user.goodreadsName = goodreadsName;
        return this.userRepository.save(user);
    }

    async deleteUser(id: string, accessToken: string): Promise<void> {
        let userToRemove = await this.userRepository.findOne({ where: { id: id } });
        if (!userToRemove) {
            throw new Error("User not found");
        }

        await this.userRepository.remove(userToRemove);

        var params = {
            AccessToken: accessToken
        };

        await new Promise((resolve, reject) => {
            this.cognitoidentityserviceprovider.deleteUser(params, (err, data) => {
                if (err) {
                    this.userRepository.insert(userToRemove!);
                    console.log(err, err.stack);
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    // ... any other service methods ...
}
