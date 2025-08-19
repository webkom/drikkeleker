"use client";

import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";


interface LobbyProps {
    roomInput: string;
    setRoomInput: (room: string) => void;
    onEnterRoom: () => void;
}

export const Lobby = ({
                          roomInput,
                          setRoomInput,
                          onEnterRoom,
                      }: LobbyProps) => {

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            onEnterRoom();
        }
    };

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Skriv in navnet på rommet</CardTitle>
                    <CardDescription>
                        Om det eksisterer, blir du med, ellers lages ett nytt!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="room">Navn</Label>
                        <Input
                            id="room"
                            placeholder="Gruppe3"
                            value={roomInput}
                            onChange={(e) => setRoomInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={onEnterRoom} className="w-full bg-teal-500 hover:bg-teal-600">
                        Bli med
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
