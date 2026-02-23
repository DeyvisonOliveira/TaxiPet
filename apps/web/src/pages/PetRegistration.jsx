
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import BottomNavigation from '@/components/BottomNavigation.jsx';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { PawPrint, Upload, Trash2, Edit } from 'lucide-react';

const PetRegistration = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    photo: null,
    phone: '',
    registration_number: '',
    age: '',
    animal_type: '',
    size: '',
  });

  const animalTypes = ['dog', 'cat', 'fish', 'parrot', 'lizard', 'rabbit', 'hamster', 'turtle', 'bird', 'other'];
  const sizes = [
    { value: 'small', label: 'Small (1-5kg)' },
    { value: 'medium', label: 'Medium (6-10kg)' },
    { value: 'large', label: 'Large (10-50kg)' },
  ];

  useEffect(() => {
    loadPets();
  }, [currentUser]);

  const loadPets = async () => {
    try {
      const userPets = await pb.collection('pets').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false,
      });
      setPets(userPets);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('userId', currentUser.id);
      data.append('name', formData.name);
      data.append('animal_type', formData.animal_type);
      data.append('size', formData.size);
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.registration_number) data.append('registration_number', formData.registration_number);
      if (formData.age) data.append('age', formData.age);
      if (formData.photo) data.append('photo', formData.photo);

      if (editingPet) {
        await pb.collection('pets').update(editingPet.id, data, { $autoCancel: false });
        toast({
          title: 'Pet atualizado!',
          description: `${formData.name} foi atualizado com sucesso`,
        });
      } else {
        await pb.collection('pets').create(data, { $autoCancel: false });
        toast({
          title: 'Pet cadastrado!',
          description: `${formData.name} foi adicionado com sucesso`,
        });
      }

      setFormData({
        name: '',
        photo: null,
        phone: '',
        registration_number: '',
        age: '',
        animal_type: '',
        size: '',
      });
      setEditingPet(null);
      loadPets();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o pet',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      photo: null,
      phone: pet.phone || '',
      registration_number: pet.registration_number || '',
      age: pet.age || '',
      animal_type: pet.animal_type,
      size: pet.size,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (petId, petName) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${petName}?`)) return;

    try {
      await pb.collection('pets').delete(petId, { $autoCancel: false });
      toast({
        title: 'Pet removido',
        description: `${petName} foi removido com sucesso`,
      });
      loadPets();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o pet',
        variant: 'destructive',
      });
    }
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
        <title>Meus Pets - TP Taxi Pet</title>
        <meta name="description" content="Gerencie seus pets cadastrados" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />

        <div className="pt-20 px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-6"
          >
            <div className="flex items-center mb-6">
              <PawPrint className="w-6 h-6 text-[#FFC107] mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">
                {editingPet ? 'Editar Pet' : 'Cadastrar Novo Pet'}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Pet *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-gray-900"
                    placeholder="Rex"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Animal *</label>
                  <select
                    name="animal_type"
                    value={formData.animal_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-gray-900"
                  >
                    <option value="">Selecione</option>
                    {animalTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho *</label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-gray-900"
                  >
                    <option value="">Selecione</option>
                    {sizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Idade (anos)</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-gray-900"
                    placeholder="3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone de Contato</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-gray-900"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Registro</label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-gray-900"
                    placeholder="REG123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Pet</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-gray-700">Escolher arquivo</span>
                    <input
                      type="file"
                      name="photo"
                      onChange={handleChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                  {formData.photo && (
                    <span className="text-sm text-gray-600">{formData.photo.name}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white py-6 text-lg font-semibold"
                >
                  {submitting ? 'Salvando...' : editingPet ? 'Atualizar Pet' : 'Cadastrar Pet'}
                </Button>
                {editingPet && (
                  <Button
                    type="button"
                    onClick={() => {
                      setEditingPet(null);
                      setFormData({
                        name: '',
                        photo: null,
                        phone: '',
                        registration_number: '',
                        age: '',
                        animal_type: '',
                        size: '',
                      });
                    }}
                    variant="outline"
                    className="px-6"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Meus Pets</h2>
            {pets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Você ainda não cadastrou nenhum pet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pets.map((pet) => (
                  <div key={pet.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#FFC107] transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {pet.photo && (
                          <img
                            src={pb.files.getUrl(pet, pet.photo)}
                            alt={pet.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{pet.animal_type}</p>
                          <p className="text-sm text-gray-500 capitalize">{pet.size}</p>
                          {pet.age && <p className="text-sm text-gray-500">{pet.age} anos</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(pet)}
                          size="sm"
                          variant="outline"
                          className="p-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(pet.id, pet.name)}
                          size="sm"
                          variant="outline"
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <BottomNavigation />
      </div>
    </>
  );
};

export default PetRegistration;
