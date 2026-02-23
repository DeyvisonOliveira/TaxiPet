
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import BottomNavigation from '@/components/BottomNavigation.jsx';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Search, MapPin, Navigation, Clock } from 'lucide-react';

const HomePage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockLocations = [
    { id: 1, name: 'PetShop Amigo Fiel', type: 'petshop', address: 'Rua das Flores, 123', distance: '1.2 km' },
    { id: 2, name: 'Clínica Veterinária Vida Animal', type: 'vet', address: 'Av. Principal, 456', distance: '2.5 km' },
    { id: 3, name: 'Pet Store Mundo Pet', type: 'store', address: 'Rua do Comércio, 789', distance: '3.1 km' },
    { id: 4, name: 'Hospital Veterinário 24h', type: 'vet', address: 'Av. Central, 321', distance: '4.0 km' },
  ];

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const userPets = await pb.collection('pets').getFullList({
        filter: `userId = "${currentUser.id}"`,
        $autoCancel: false,
      });
      setPets(userPets);

      const history = await pb.collection('search_history').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false,
      });
      setSearchHistory(history.slice(0, 5));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchAddress.trim()) {
      toast({
        title: 'Digite um endereço',
        description: 'Por favor, insira um endereço para buscar',
        variant: 'destructive',
      });
      return;
    }

    try {
      await pb.collection('search_history').create({
        userId: currentUser.id,
        address: searchAddress,
      }, { $autoCancel: false });

      toast({
        title: 'Busca realizada!',
        description: `Procurando locais próximos a ${searchAddress}`,
      });

      loadUserData();
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const handleRequestRide = () => {
    toast({
      title: '🚧 Funcionalidade em desenvolvimento',
      description: 'A solicitação de corrida estará disponível em breve!',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1F44]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FFC107] mx-auto"></div>
          <p className="mt-4 text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Home - TP Taxi Pet</title>
        <meta name="description" content="Transporte seu pet com segurança e conforto" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />

        <div
          className="relative h-64 bg-cover bg-center mt-16"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1693377546019-b5b43a206197)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A1F44]/80 to-[#0A1F44]/60"></div>
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Olá, {currentUser?.name}! 🐾
              </h1>
              <p className="text-white/90 text-lg">Para onde vamos hoje?</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecione seu pet</label>
              <select
                value={selectedPet}
                onChange={(e) => setSelectedPet(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-gray-900"
              >
                <option value="">Escolha um pet</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} - {pet.animal_type} ({pet.size})
                  </option>
                ))}
              </select>
              {pets.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Você ainda não cadastrou nenhum pet. Vá para Options para adicionar.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Para onde vamos?</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    placeholder="Digite o endereço de destino"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-gray-900"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-[#FFC107] hover:bg-[#FFC107]/90 text-[#0A1F44] font-semibold px-6"
                >
                  Buscar
                </Button>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Mapa de Locais Próximos</p>
                <p className="text-sm text-gray-500 mt-1">Petshops, Veterinárias e Pet Stores</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockLocations.map((location) => (
                <div
                  key={location.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#FFC107] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{location.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Navigation className="w-4 h-4 mr-1" />
                        {location.distance}
                      </div>
                    </div>
                    <Button
                      onClick={handleRequestRide}
                      size="sm"
                      className="bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white"
                    >
                      Ir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {searchHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Buscas Recentes</h2>
              </div>
              <div className="space-y-2">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => setSearchAddress(item.address)}
                  >
                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-700">{item.address}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <BottomNavigation />
      </div>
    </>
  );
};

export default HomePage;
