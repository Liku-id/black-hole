import { Box, Card, CardContent } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import {
    Body1,
    Body2,
    Caption,
    TextField
} from '@/components/common';
import CreatorsTable from '@/components/features/creators/table';
import { useAuth } from '@/contexts/AuthContext';
import { useEventOrganizers } from '@/hooks/features/organizers';
import DashboardLayout from '@/layouts/dashboard';
import { User } from '@/types/auth';
import { ListEventOrganizersRequest } from '@/types/organizer';
import { useDebouncedCallback } from '@/utils';

function Creator() {
    const router = useRouter();
    const { user } = useAuth();
    const [searchValue, setSearchValue] = useState('');
    const [filters, setFilters] = useState<ListEventOrganizersRequest>({
        show: 10,
        page: 0,
        name: ''
    });

    const { eventOrganizers, loading, error, mutate, pagination } =
        useEventOrganizers(filters);

    const debouncedSetFilters = useDebouncedCallback((value: string) => {
        setFilters((prev) => ({
            ...prev,
            name: value,
            page: 0
        }));
    }, 1000);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchValue(value);
        debouncedSetFilters(value);
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage
        }));
    };

    useEffect(() => {
        if (user) {
            const userRole = (user as User).role?.name;
            if (userRole !== 'admin' && userRole !== 'business_development') {
                router.push('/events');
            }
        }
    }, [user, router]);

    return (
        <DashboardLayout>
            <Head>
                <title>Creators - Black Hole Dashboard</title>
            </Head>

            <Box>
                <Card sx={{ backgroundColor: 'common.white', borderRadius: 0 }}>
                    <CardContent sx={{ padding: '16px 24px' }}>
                        {/* Header with Title and Search */}
                        <Box
                            alignItems="center"
                            display="flex"
                            justifyContent="space-between"
                            borderBottom="0.5px solid "
                            borderColor="grey.100"
                            pb={2}
                        >
                            <Body1 color="text.primary" fontSize="16px" fontWeight={700}>
                                Creators Details
                            </Body1>

                            <TextField
                                placeholder="Creator Name"
                                startComponent={
                                    <Image
                                        alt="Search"
                                        height={20}
                                        src="/icon/search.svg"
                                        width={20}
                                    />
                                }
                                sx={{ width: 300 }}
                                value={searchValue}
                                onChange={handleSearchChange}
                            />
                        </Box>

                        {/* Creators Table */}
                        <Box mb={2}>
                            <CreatorsTable
                                creators={eventOrganizers}
                                loading={loading}
                                onRefresh={mutate}
                                total={pagination?.total || 0}
                                currentPage={filters.page || 0}
                                pageSize={filters.show || 10}
                                onPageChange={handlePageChange}
                            />
                        </Box>

                        {/* Error Alert */}
                        {error && (
                            <Box py={4} textAlign="center">
                                <Body2 gutterBottom>Failed to load creators</Body2>
                                <Body2>{error}</Body2>
                                <Caption color="text.secondary" sx={{ mt: 1 }}>
                                    Please check your backend connection and try again.
                                </Caption>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
}

export default withAuth(Creator, { requireAuth: true });

