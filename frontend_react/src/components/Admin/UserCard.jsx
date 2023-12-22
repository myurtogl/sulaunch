import { Text,Card} from '@chakra-ui/react'

export default function UserCard({selected}) {
 
    if (selected != null) {
        return (
  
             <Card justify={"end"} mt={"4"} px={"4"}>
                <Text>Full Name: {selected.name} {selected.surname}</Text>
                <Text>Username: {selected.username}</Text>
                <Text>Wallet: {selected.address}</Text>
                <Text>Email: {selected.mailAddress}</Text>
                <Text>Role: {selected.role}</Text>
             </Card>
        );
    }
    
}
