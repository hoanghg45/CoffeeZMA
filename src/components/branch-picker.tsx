import React, { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRecoilState, useRecoilValue, useRecoilValueLoadable } from "recoil";
import { Box, Sheet, Text } from "zmp-ui";
import { ChevronRight, Check } from "lucide-react";
import { selectedStoreIdState, storesState, locationState } from "../state";
import { Store } from "../types/delivery";
import { displayDistance, calculateDistance } from "../utils/location";

export const BranchPicker: FC = () => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const storesLoadable = useRecoilValueLoadable(storesState);
  const [selectedStoreId, setSelectedStoreId] = useRecoilState(selectedStoreIdState);
  const location = useRecoilValue(locationState);

  const stores = storesLoadable.state === 'hasValue' ? storesLoadable.contents : [];

  // Get selected store
  const selectedStore = stores.find(s => s.id === selectedStoreId) || stores[0] || null;

  // Set default store on first load
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId && selectedStore) {
      setSelectedStoreId(selectedStore.id);
    }
  }, [stores, selectedStoreId, selectedStore, setSelectedStoreId]);

  // Calculate distances if location is available
  const storesWithDistance = stores.map(store => {
    if (location) {
      return {
        ...store,
        distance: calculateDistance(
          parseFloat(location.latitude),
          parseFloat(location.longitude),
          store.lat,
          store.long
        )
      };
    }
    return { ...store, distance: undefined };
  });

  // Sort by distance if available, otherwise by name
  const sortedStores = [...storesWithDistance].sort((a, b) => {
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <Box
        className="flex items-center active:opacity-80 cursor-pointer"
        onClick={() => setVisible(true)}
      >
        <Box className="flex-1 min-w-0">
          <Text.Title size="small" className="font-bold truncate">
            {selectedStore?.name || "Chọn cửa hàng"}
          </Text.Title>
          <Text size="xSmall" className="text-gray-500 line-clamp-2 break-words">
            {selectedStore?.address || "Vui lòng chọn cửa hàng giao hàng"}
            {selectedStore && location && storesWithDistance.find(s => s.id === selectedStore.id)?.distance !== undefined && (
              <span className="ml-2 whitespace-nowrap">
                - {displayDistance(storesWithDistance.find(s => s.id === selectedStore.id)!.distance!)}
              </span>
            )}
          </Text>
        </Box>
        <ChevronRight size={20} className="text-gray-400 ml-2" />
      </Box>

      {mounted && createPortal(
        <Sheet
          visible={visible}
          onClose={() => setVisible(false)}
          mask
          swipeToClose
          height="auto"
          style={{ zIndex: 12000 }}
        >
          <Box className="p-4 space-y-4 pb-8">
            <Text.Title>Chọn cửa hàng</Text.Title>

            <Box className="space-y-2 max-h-[60vh] overflow-y-auto">
              {sortedStores.map((store) => {
                const isSelected = store.id === selectedStoreId;
                const distance = store.distance;

                return (
                  <Box
                    key={store.id}
                    className={`p-3 rounded-lg border ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    onClick={() => {
                      setSelectedStoreId(store.id);
                      setVisible(false);
                    }}
                  >
                    <Box className="flex justify-between items-start">
                      <Box className="flex-1">
                        <Text.Title size="small">{store.name}</Text.Title>
                        <Text size="xSmall" className="text-gray-500 mt-1">
                          {store.address}
                        </Text>
                        {store.phone && (
                          <Text size="xSmall" className="text-gray-500">
                            {store.phone}
                          </Text>
                        )}
                      </Box>
                      {isSelected && (
                        <Check className="text-green-600 ml-2" size={20} />
                      )}
                    </Box>
                    {distance !== undefined && (
                      <Box className="mt-2">
                        <Text size="xSmall" className="text-blue-600">
                          Khoảng cách: {displayDistance(distance)}
                        </Text>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Sheet>,
        document.body
      )}
    </>
  );
};

