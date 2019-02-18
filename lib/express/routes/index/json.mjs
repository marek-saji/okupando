import { getStatus } from '../../../status';


export default async res => {
    const status = await getStatus();
    res.json(status);
};
