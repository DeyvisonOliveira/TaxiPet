
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import BottomNavigation from '@/components/BottomNavigation.jsx';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { User, Wallet, History, Settings, CreditCard, HelpCircle, MessageSquare, FileText, Briefcase, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logout realizado',
      description: 'Até logo! Volte sempre.',
    });
  };

  const handleFeatureClick = (feature) => {
    toast({
      title: '🚧 Funcionalidade em desenvolvimento',
      description: `${feature} estará disponível em breve!`,
    });
  };

  const renderBoneRating = (rating) => {
    const bones = [];
    const fullBones = Math.floor(rating || 0);
    for (let i = 0; i < 5; i++) {
      bones.push(
        <span key={i} className={i < fullBones ? 'text-[#FFC107]' : 'text-gray-300'}>
          🦴
        </span>
      );
    }
    return bones;
  };

  return (
    <>
      <Helmet>
        <title>Perfil - TP Taxi Pet</title>
        <meta name="description" content="Gerencie seu perfil e configurações" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />

        <div className="pt-20 px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#0A1F44] to-[#0A1F44]/90 rounded-2xl shadow-xl p-8 mb-6 text-white"
          >
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24 border-4 border-[#FFC107]">
                <AvatarImage src={currentUser?.avatar ? pb.files.getUrl(currentUser, currentUser.avatar) : ''} />
                <AvatarFallback className="bg-[#FFC107] text-[#0A1F44] text-2xl font-bold">
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{currentUser?.name} {currentUser?.surname}</h1>
                <p className="text-white/80">{currentUser?.email}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-2">Avaliação:</span>
                  <div className="flex">{renderBoneRating(currentUser?.rating || 4.5)}</div>
                  <span className="ml-2 text-sm">({currentUser?.rating?.toFixed(1) || '4.5'})</span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wallet className="w-6 h-6 text-[#FFC107] mr-2" />
                  <span className="font-semibold">Saldo CachPet</span>
                </div>
                <span className="text-2xl font-bold text-[#FFC107]">
                  {currentUser?.cachpet_balance || 0} pontos
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 gap-2">
                <TabsTrigger value="history">
                  <History className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Corridas</span>
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Config</span>
                </TabsTrigger>
                <TabsTrigger value="billing">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Cobrança</span>
                </TabsTrigger>
                <TabsTrigger value="support">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Suporte</span>
                </TabsTrigger>
                <TabsTrigger value="suggestions">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Sugestões</span>
                </TabsTrigger>
                <TabsTrigger value="terms">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Termos</span>
                </TabsTrigger>
                <TabsTrigger value="work">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Trabalhe</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="mt-6">
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Histórico de Corridas</h3>
                  <p className="text-gray-600 mb-4">Você ainda não realizou nenhuma corrida</p>
                  <Button onClick={() => handleFeatureClick('Histórico de corridas')} className="bg-[#0A1F44] hover:bg-[#0A1F44]/90">
                    Ver Detalhes
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações da Conta</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleFeatureClick('Editar perfil')}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                    <Button
                      onClick={() => handleFeatureClick('Alterar senha')}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Alterar Senha
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair da Conta
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="mt-6">
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Métodos de Pagamento</h3>
                  <p className="text-gray-600 mb-4">Gerencie seus cartões e formas de pagamento</p>
                  <Button onClick={() => handleFeatureClick('Métodos de pagamento')} className="bg-[#0A1F44] hover:bg-[#0A1F44]/90">
                    Adicionar Cartão
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="support" className="mt-6">
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Central de Ajuda</h3>
                  <p className="text-gray-600 mb-4">Precisa de ajuda? Estamos aqui para você!</p>
                  <Button onClick={() => handleFeatureClick('Suporte')} className="bg-[#0A1F44] hover:bg-[#0A1F44]/90">
                    Falar com Suporte
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-6">
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Envie suas Sugestões</h3>
                  <p className="text-gray-600 mb-4">Sua opinião é muito importante para nós!</p>
                  <Button onClick={() => handleFeatureClick('Sugestões')} className="bg-[#0A1F44] hover:bg-[#0A1F44]/90">
                    Enviar Sugestão
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="terms" className="mt-6">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Termos de Uso</h3>
                  <p className="text-gray-600 mb-4">Leia nossos termos e políticas de privacidade</p>
                  <Button onClick={() => handleFeatureClick('Termos de uso')} className="bg-[#0A1F44] hover:bg-[#0A1F44]/90">
                    Ver Termos
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="work" className="mt-6">
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Trabalhe Conosco</h3>
                  <p className="text-gray-600 mb-4">Seja um motorista parceiro do TP - Taxi Pet</p>
                  <Button onClick={() => handleFeatureClick('Trabalhe conosco')} className="bg-[#FFC107] hover:bg-[#FFC107]/90 text-[#0A1F44]">
                    Quero ser Motorista
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        <BottomNavigation />
      </div>
    </>
  );
};

export default ProfilePage;
