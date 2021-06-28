@tweets.each do |tweet|
  json.set! tweet.id do
    json.extract! tweet, :content, :user_id
    json.username tweet.user.username
    json.mentioned_users tweet.mentioned_users do |user|
      json.user_id user.id
      json.username user.username
    end
  end
end