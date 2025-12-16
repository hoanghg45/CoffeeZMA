import React, { FC, useState } from "react";
import { Sheet, Button, Box, Text } from "zmp-ui";
import { useSetRecoilState } from "recoil";
import { loyaltyPromptState } from "state";
import { markCustomerAsLoyaltyMember } from "services/customer";
import { User } from "lucide-react";

interface LoyaltyOptinSheetProps {
    visible: boolean;
    onClose: () => void;
    onContinue: () => void; // Called after join or skip
    customerId: string;
}

export const LoyaltyOptinSheet: FC<LoyaltyOptinSheetProps> = ({
    visible,
    onClose,
    onContinue,
    customerId,
}) => {
    const [isJoining, setIsJoining] = useState(false);
    const setLoyaltyPromptDismissed = useSetRecoilState(loyaltyPromptState);
    // We might want to refresh the profile after joining
    // but Recoil selector should handle it if we invalidate or update local cache?
    // Ideally, `markCustomerAsLoyaltyMember` updates DB.
    // We might need to trigger a re-fetch of `customerProfileState`.
    // Recoil doesn't have a built-in "refetch" for selectors easily without a dependency change.
    // A common pattern is using a request ID atom.
    // For now, let's assume the user will proceed to checkout and the backend checks are done, 
    // or the UI updates optimistically? 
    // We can just proceed.

    // Using a simplified refresh approach: 
    // We won't force-refresh the selector here immediately unless we have a mechanism.
    // But for the checkout flow, we just want to proceed.

    const handleJoin = async () => {
        setIsJoining(true);
        await markCustomerAsLoyaltyMember(customerId, "checkout_sheet");
        // Optimistically or basically we are done.
        setIsJoining(false);
        onContinue();
    };

    const handleSkip = () => {
        setLoyaltyPromptDismissed(true);
        onContinue();
    };

    return (
        <Sheet
            visible={visible}
            onClose={onClose}
            mask
            handler
            swipeToClose
            height="auto" // Adjust as needed
        >
            <Box className="p-6 flex flex-col items-center text-center space-y-4 pb-10">
                <Box className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                    <User className="text-yellow-600" size={32} />
                </Box>

                <Text.Title size="large" className="font-bold text-gray-800">
                    Trở thành thành viên
                </Text.Title>

                <Text size="normal" className="text-gray-500 px-4">
                    Tích điểm đổi quà và nhận nhiều ưu đãi độc quyền từ Muối Coffee & Tea.
                </Text>

                <Box className="w-full flex flex-col gap-3 mt-4">
                    <Button
                        fullWidth
                        onClick={handleJoin}
                        loading={isJoining}
                        className="rounded-full font-bold text-base bg-primary text-black"
                    >
                        Tham gia ngay
                    </Button>

                    <Button
                        fullWidth
                        variant="tertiary"
                        onClick={handleSkip}
                        className="rounded-full font-medium text-gray-500"
                    >
                        Để sau
                    </Button>
                </Box>
            </Box>
        </Sheet>
    );
};
