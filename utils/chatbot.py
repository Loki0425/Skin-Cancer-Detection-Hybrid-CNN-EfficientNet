def get_chatbot_reply(message):

    msg = message.lower()

    if "melanoma" in msg:
        return "Melanoma is a serious form of skin cancer. Early detection improves survival."

    if "nv" in msg:
        return "NV (Melanocytic Nevus) is usually benign."

    if "treatment" in msg:
        return "Please consult a certified dermatologist for treatment options."

    if "risk" in msg:
        return "High risk results should be clinically verified."

    return "I am an AI assistant. For medical advice, consult a dermatologist."
