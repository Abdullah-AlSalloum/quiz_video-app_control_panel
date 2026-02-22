import Box from '@mui/material/Box';
import StatCardsRow from '../components/dashboard/StatCardsRow';
import PaymentsOverview from '../components/dashboard/UsersOverview';
import ProfitLastWeek from '../components/dashboard/ProfitWeek';
import UsedDevices from '../components/dashboard/UsedDevices';
import RegionLabelsMap from '../components/dashboard/RegionLabelsMap';

export default function Home() {
  return (
    <div>
      <StatCardsRow />
      <Box
        sx={{
          marginTop: 3,
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.2fr 1fr'
          },
          gridTemplateAreas: {
            xs: `
              "used"
              "map"
              "profit"
              "payments"
            `,
            lg: `
              "payments profit"
              "used map"
            `
          }
        }}
      >
        <Box sx={{ gridArea: 'used' }}>
          <UsedDevices />
        </Box>
        <Box sx={{ gridArea: 'map' }}>
          <RegionLabelsMap />
        </Box>
        <Box sx={{ gridArea: 'profit' }}>
          <ProfitLastWeek />
        </Box>
        <Box sx={{ gridArea: 'payments' }}>
          <PaymentsOverview />
        </Box>
      </Box>
    </div>
  );
}
