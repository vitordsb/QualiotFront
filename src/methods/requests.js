const buscarPerguntas = async () => {
    try {
        const token = localStorage.getItem('token');
        const abaSelecionada = localStorage.getItem('abaSelecionada');
        const response = await fetch(
            `https://qualiotbackend.onrender.com/questions/get-by-category/${abaSelecionada}?details=false`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const data = await response.json();

        const perguntas = localStorage.setItem("perguntas", await data.questionCategory.map((pergunta) => pergunta.title));
        return perguntas
    } catch (error) {
        console.error('Erro ao buscar perguntas:', error);
    }
};

export { buscarPerguntas };