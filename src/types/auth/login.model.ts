import {UserModel} from '../user/user.model';

export type LoginModel = {
    userName: string;
    password: string;
}

export type LoginResponse = {
    user: UserModel;
    token: string;
};
